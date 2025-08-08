import os
import json
from dotenv import load_dotenv
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Document
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404


from .serializers import DocumentSerializer
from cryptography.fernet import InvalidToken

from django.utils.dateparse import parse_date
from cryptography.fernet import Fernet

import logging
from .logger import log_exception, log_exceptions
import uuid
import time
import threading
import queue

# Setup logger
logger = logging.getLogger(__name__)

# Updated import with new streaming function
from .vertex_model import call_gemini_api_with_streaming, MODEL_ID
import yaml
import configparser

# ... (keep your existing APP_CONFIG loading code)

# Initialize prompts
APP_CONFIG = {}
CONFIG_FILE_PATH = os.path.join(settings.BASE_DIR, 'Prompts', 'prompts.yaml')

def load_prompts():
    """Load prompts from YAML file"""
    global APP_CONFIG
    try:
        with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
            APP_CONFIG = yaml.safe_load(f)
        logger.info(f"Successfully loaded prompts from {CONFIG_FILE_PATH}")
        logger.debug(f"APP_CONFIG keys: {list(APP_CONFIG.keys())}")
        if 'prompts' in APP_CONFIG and isinstance(APP_CONFIG['prompts'], dict):
            logger.debug(f"prompts keys: {list(APP_CONFIG['prompts'].keys())}")
    except FileNotFoundError:
        logger.critical(f"Prompts file not found at {CONFIG_FILE_PATH}. Please ensure it exists.")
        raise 
    except Exception as e:
        logger.critical(f"Error loading prompts from YAML at {CONFIG_FILE_PATH}: {e}", exc_info=True)
        raise

load_prompts()

# ... (keep your existing environment loading and helper functions)

env_path = os.path.join(settings.BASE_DIR, '.env') if hasattr(settings, 'BASE_DIR') else None
if env_path and os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

def safe_json_load(raw_string: str):
    if not raw_string or not raw_string.strip():
        raise json.JSONDecodeError("Empty or whitespace-only string", raw_string, 0)

    cleaned = raw_string.strip()

    if cleaned.startswith("```json"):
        lines = cleaned.splitlines()
        if len(lines) > 2 and lines[-1].strip() == "```":
            cleaned = "\n".join(lines[1:-1])
        else:
            cleaned = "\n".join(lines[1:])

    return json.loads(cleaned)

def get_fernet_key():
    try:
        config = configparser.ConfigParser()
        config_path = os.path.join(os.path.dirname(__file__), 'config.properties')
        
        if not os.path.exists(config_path):
            logger.error(f"Config file not found at {config_path}")
            return None
        
        config.read(config_path)
        key = config.get('Input', 'FERNET_KEY')
        if not key:
            logger.error("Fernet key not found in config.properties")
            return None
        try:
            Fernet(key.encode())
        except Exception as e:
            logger.error(f"Invalid Fernet key: {str(e)}")
            return None
        return key
    except Exception as e:
        logger.error(f"Error loading Fernet key: {str(e)}")
        return None

FERNET_KEY = get_fernet_key()

if not FERNET_KEY:
    logger.error("Fernet key initialization failed")

def encrypt_id(id: int) -> str:
    fernet = Fernet(FERNET_KEY)
    id_bytes = str(id).encode()
    encrypted = fernet.encrypt(id_bytes)
    return encrypted.decode()

def decrypt_id(token: str) -> int:
    fernet = Fernet(FERNET_KEY)
    decrypted = fernet.decrypt(token.encode())
    return int(decrypted.decode())

# Updated views with user restrictions and streaming

class GetDocumentByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, doc_id):
        try:
            logger.info(f"GetDocumentByIdView called with encrypted ID: {doc_id}")

            decrypted_id = decrypt_id(doc_id)
            logger.debug(f"Decrypted ID: {decrypted_id}")

            with log_exceptions(logger):
                doc = get_object_or_404(Document, id=decrypted_id)

                # Updated permission checks with user types
                user = request.user
                is_admin = user.user_type == "admin"

                if not is_admin and doc.userid_id != request.user.id:
                    logger.warning(
                        f"User {request.user.id} attempted to access document {decrypted_id} without permission"
                    )
                    return Response(
                        {"error": "You do not have permission to view this document."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                logger.info(f"Document {decrypted_id} retrieved successfully")

                file_url = request.build_absolute_uri(doc.file.url)

                response_data = {
                    "status": "success",
                    "filepath": file_url,
                    "json_data": doc.json_data,
                    "input_token": doc.input_token,
                    "output_token": doc.output_token,
                    "api_response_time": doc.api_response_time,
                    "db_save_time": doc.db_save_time,
                    "llm_model_used": doc.llm_model_used,
                    "pages_processed": getattr(doc, 'pages_processed', 1),
                    "is_full_document": getattr(doc, 'is_full_document', False),
                }

            return Response(response_data, status=status.HTTP_200_OK)

        except InvalidToken:
            logger.error("Invalid or corrupted document ID provided.", exc_info=True)
            return Response(
                {"error": "Invalid or corrupted document ID"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            logger.error("Error while fetching document by ID", exc_info=True)
            return Response(
                {"error": "An internal server error occurred while retrieving the document."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            logger.info(f"UserDocumentView accessed by user ID: {user.id}")

            # Determine if the requesting user is an admin based on user_type
            is_admin = user.user_type == "admin"

            if is_admin:
                documents = Document.objects.all()
                logger.info("Admin user detected: Fetching all documents.")
            else:
                documents = Document.objects.filter(userid=user)
                logger.info(f"Fetching documents for user ID: {user.id}")

            serializer = DocumentSerializer(documents, many=True)
            serialized_data = serializer.data
            logger.info(f"{len(serialized_data)} documents retrieved successfully.")

            # Encrypt the 'id' field
            for doc in serialized_data:
                doc['id'] = encrypt_id(doc['id'])

            total_input_tokens = sum(getattr(doc, "input_token", 0) or 0 for doc in documents)
            total_output_tokens = sum(getattr(doc, "output_token", 0) or 0 for doc in documents)

            # Add user usage information
            usage_info = user.get_usage_info() if hasattr(user, 'get_usage_info') else {}
            
            logger.info(f"{len(serialized_data)} documents retrieved. Total input: {total_input_tokens}, output: {total_output_tokens}")
            
            return Response({
                "count": documents.count(),
                "documents": serialized_data,
                "total_input_tokens": total_input_tokens,
                "total_output_tokens": total_output_tokens,
                "user_usage": usage_info,  # Add usage information
            }, status=status.HTTP_200_OK)
            
        except Exception:
            logger.error("Exception occurred while fetching user documents.", exc_info=True)
            log_exception(logger)
            return Response({
                "status": "error",
                "message": "An error occurred while retrieving documents. Please try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FilteredDocumentView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('userid')
            date_str = request.data.get('date')

            logger.info(f"FilteredDocumentView called with user_id={user_id} and date={date_str}")

            if not user_id or not date_str:
                logger.warning("Missing 'userid' or 'date' in request body.")
                return Response({
                    "error": "Both 'userid' and 'date' fields are required in the request body."
                }, status=status.HTTP_400_BAD_REQUEST)

            entry_date = parse_date(date_str)
            if not entry_date:
                logger.warning(f"Invalid date format received: {date_str}")
                return Response({
                    "error": "Invalid date format. Please use ISO-MM-DD."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Updated admin check
            user = request.user
            is_admin = user.user_type == "admin"

            try:
                user_id_int = int(user_id)
            except (TypeError, ValueError):
                logger.warning(f"Invalid user ID format received: {user_id}")
                return Response(
                    {"error": "Invalid user ID. It must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not is_admin and user_id_int != request.user.id:
                logger.warning(
                    f"User {request.user.id} attempted to filter documents for user {user_id} without permission"
                )
                return Response(
                    {"error": "You do not have permission to view these documents."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            documents = Document.objects.filter(userid=user_id_int, entry_date=entry_date)
            serializer = DocumentSerializer(documents, many=True)

            logger.info(f"{documents.count()} documents found for user_id={user_id} on {entry_date}")

            return Response({
                "count": documents.count(),
                "documents": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception:
            logger.error("Exception occurred while filtering documents.", exc_info=True)
            log_exception(logger)
            return Response({
                "error": "An internal error occurred. Please try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadAndProcessFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("pdf_file")
        prompt_text_from_request = request.POST.get("prompt_text")
        doc_type = request.POST.get("doc_type")
        process_full_document = request.POST.get("process_full_document", "false").lower() == "true"

        logger.info("Upload request received")

        user = request.user
        input_tokens = 0
        output_tokens = 0

        if not uploaded_file:
            logger.error("Upload failed: 'pdf_file' is missing in the request.", exc_info=True)
            return Response(
                {"status": "error", "message": "Missing 'pdf_file"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check user permissions and document limits
        can_process, limit_message = user.can_process_document()
        if not can_process:
            logger.warning(f"User {user.id} hit document limit: {limit_message}")
            return Response({
                "status": "error", 
                "message": limit_message,
                "usage_info": user.get_usage_info()
            }, status=status.HTTP_403_FORBIDDEN)

        # Determine page limit based on user type
        max_pages = 3
        if user.user_type in ['power', 'admin'] and process_full_document:
            max_pages = None
        
        # Determine prompt text
        prompt_text = None
        if prompt_text_from_request:
            prompt_text = prompt_text_from_request
        else:
            if doc_type == 'docextraction':
                prompt_text = APP_CONFIG.get('prompts', {}).get('doc_extraction_prompt', '')
            elif doc_type == 'Bill Reimbursment':
                prompt_text = APP_CONFIG.get('prompts', {}).get('reimbursement_extraction_prompt', '')
            else:
                prompt_text = APP_CONFIG.get('prompts', {}).get('doc_extraction_prompt', '')

        if not prompt_text:
            logger.error(f"Prompt text is empty or not found in prompts.yaml for doc_type: {doc_type}.")
            return Response(
                {"status": "error", "message": "Prompt text could not be determined for the document type."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            with log_exceptions(logger):
                # Save uploaded file
                custom_dir = "uploads/pdf_files"
                save_dir = os.path.join(settings.MEDIA_ROOT, custom_dir)
                os.makedirs(save_dir, exist_ok=True)

                file_name = uploaded_file.name
                name_without_ext, extension = os.path.splitext(file_name)
                extension = extension.lower()
                sanitized_name = name_without_ext.replace("/", "_").replace("\\", "_")
                unique_name = f"{sanitized_name}_{uuid.uuid4()}{extension}"
                relative_path = default_storage.save(
                    os.path.join(custom_dir, unique_name), uploaded_file
                )
                absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)

                if extension not in [".jpg", ".jpeg", ".png", ".pdf"]:
                    logger.error("Unsupported file type provided.", exc_info=True)
                    return Response(
                        {"status": "error", "message": "Unsupported file type"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Progress tracking for streaming updates
                progress_messages = []
                
                def progress_callback(message):
                    progress_messages.append({
                        "timestamp": time.time(),
                        "message": message
                    })

                # Extract structured JSON with streaming and page limitation
                try:
                    api_start = time.time()
                    response = call_gemini_api_with_streaming(
                        prompt_text=prompt_text,
                        input_data=absolute_path,
                        response_mime_type="application/json",
                        max_pages=max_pages,
                        progress_callback=progress_callback
                    )
                    api_response_time = time.time() - api_start

                    if not response or 'candidates' not in response:
                        logger.error(
                            "Invalid API response format for JSON extraction.",
                            exc_info=True,
                        )
                        return Response(
                            {"error": "Invalid API response format"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )

                    try:
                        result_json = response['candidates'][0]['content']['parts'][0]['text']
                        pages_processed = response.get('pagesProcessed', 1)

                        if not result_json:
                            logger.error("Empty JSON response from API.", exc_info=True)
                            return Response(
                                {"error": "Empty JSON response from API"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            )

                        parsed_json = safe_json_load(result_json)

                        if parsed_json is None:
                            logger.error(
                                "Failed to parse JSON: Invalid JSON format",
                                exc_info=True,
                            )
                            return Response(
                                {"error": "Invalid JSON format received from API"},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        if isinstance(parsed_json, list) and parsed_json:
                            parsed_json = parsed_json[0]

                        if not isinstance(parsed_json, dict):
                            logger.error("Parsed JSON is not a dictionary.", exc_info=True)
                            return Response(
                                {"error": "Invalid JSON format received from API"},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        logger.debug("Successfully parsed JSON response")

                    except KeyError as e:
                        logger.error(f"Missing key in API response: {str(e)}", exc_info=True)
                        return Response(
                            {"error": "Invalid API response format"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )
                    except Exception as e:
                        logger.error(
                            f"Unexpected error processing API response: {str(e)}",
                            exc_info=True,
                        )
                        return Response(
                            {"error": "Error processing API response"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )

                except json.JSONDecodeError as e:
                    logger.error(
                        f"JSON decoding error during extraction: {str(e)}",
                        exc_info=True,
                    )
                    return Response(
                        {"error": "Invalid JSON received from API"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                except Exception as e:
                    logger.error(
                        f"Error during JSON extraction API call: {str(e)}",
                        exc_info=True,
                    )
                    return Response(
                        {"error": f"Error during JSON extraction: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                if 'usageMetadata' in response:
                    usage_metadata = response['usageMetadata']
                    input_tokens = usage_metadata.get('promptTokenCount', 0)
                    output_tokens = usage_metadata.get('candidatesTokenCount', 0)
                    logger.info(
                        f"JSON Extraction - Input Tokens: {input_tokens}, Output Tokens: {output_tokens}"
                    )
                else:
                    logger.info(
                        "JSON Extraction - Usage metadata not available in the response."
                    )

                json_filename = os.path.splitext(relative_path)[0] + ".json"
                json_path = os.path.join(settings.MEDIA_ROOT, json_filename)
                with open(json_path, "w", encoding="utf-8") as jf:
                    json.dump(parsed_json, jf, indent=2, ensure_ascii=False)

                db_start = time.time()
                doc = Document.objects.create(
                    filepath=relative_path,
                    file=relative_path,
                    json_data=parsed_json,
                    userid=user,
                    document_type=doc_type,
                    input_token=input_tokens,
                    output_token=output_tokens,
                    api_response_time=api_response_time,
                    llm_model_used=MODEL_ID,
                    pages_processed=pages_processed,
                    is_full_document=process_full_document and user.user_type in ['power', 'admin']
                )
                db_save_time = time.time() - db_start
                doc.db_save_time = db_save_time
                doc.save(update_fields=["db_save_time"])

                # Update user usage counters
                user.increment_usage(pages_processed)

                encrypted_doc_id = encrypt_id(doc.id)
                logger.info(
                    f"Document processed and saved successfully. Document ID: {encrypted_doc_id}"
                )

                # Prepare response with usage information
                response_data = {
                    "status": "success", 
                    "document_id": encrypted_doc_id,
                    "pages_processed": pages_processed,
                    "is_full_document": doc.is_full_document,
                    "progress_messages": progress_messages,
                    "usage_info": user.get_usage_info()
                }

                # Add "Load Full Document" option for power and admin users
                if (user.user_type in ['power', 'admin'] and not process_full_document and
                    pages_processed == 3):  # Only if we actually limited to 3 pages
                    response_data["can_load_full_document"] = True
                    response_data["message"] = "Processed first 3 pages. You can load the full document if needed."

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in UploadAndProcessFileView: {str(e)}", exc_info=True)
            return Response(
                {"status": "error", "message": f"An internal server error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# New view for power users to process full documents
class ProcessFullDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        document_id = request.data.get("document_id")
        
        if not document_id:
            return Response(
                {"status": "error", "message": "Missing document_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # Check if user is power user or admin
        if user.user_type not in ['power', 'admin']:
            return Response(
                {"status": "error", "message": "Only power users and admins can process full documents"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            decrypted_id = decrypt_id(document_id)
            doc = get_object_or_404(Document, id=decrypted_id)
            
            # Check ownership
            is_admin = user.user_type == 'admin'
            if not is_admin and doc.userid_id != user.id:
                return Response(
                    {"error": "You do not have permission to process this document."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            # Check if already processed as full document
            if doc.is_full_document:
                return Response(
                    {"status": "error", "message": "Document already processed as full document"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the original file path
            absolute_path = os.path.join(settings.MEDIA_ROOT, doc.filepath)
            
            if not os.path.exists(absolute_path):
                return Response(
                    {"status": "error", "message": "Original file not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Determine prompt text based on document type
            prompt_text = None
            if doc.document_type == 'docextraction':
                prompt_text = APP_CONFIG.get('prompts', {}).get('doc_extraction_prompt', '')
            elif doc.document_type == 'Bill Reimbursment':
                prompt_text = APP_CONFIG.get('prompts', {}).get('reimbursement_extraction_prompt', '')
            else:
                prompt_text = APP_CONFIG.get('prompts', {}).get('doc_extraction_prompt', '')
            
            if not prompt_text:
                return Response(
                    {"status": "error", "message": "Could not determine prompt for document type"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Progress tracking
            progress_messages = []
            
            def progress_callback(message):
                progress_messages.append({
                    "timestamp": time.time(),
                    "message": message
                })
            
            # Process full document (no page limit)
            api_start = time.time()
            response = call_gemini_api_with_streaming(
                prompt_text=prompt_text,
                input_data=absolute_path,
                response_mime_type="application/json",
                max_pages=None,  # No page limit
                progress_callback=progress_callback
            )
            api_response_time = time.time() - api_start
            
            # Process response
            result_json = response['candidates'][0]['content']['parts'][0]['text']
            pages_processed = response.get('pagesProcessed', 1)
            parsed_json = safe_json_load(result_json)
            
            # Update token usage
            if 'usageMetadata' in response:
                usage_metadata = response['usageMetadata']
                input_tokens = usage_metadata.get('promptTokenCount', 0)
                output_tokens = usage_metadata.get('candidatesTokenCount', 0)
            else:
                input_tokens = doc.input_token or 0
                output_tokens = doc.output_token or 0
            
            # Update document with full processing results
            doc.json_data = parsed_json
            doc.pages_processed = pages_processed
            doc.is_full_document = True
            doc.input_token = input_tokens
            doc.output_token = output_tokens
            doc.api_response_time = api_response_time
            doc.save()
            
            # Update user usage (difference in pages)
            pages_difference = pages_processed - (doc.pages_processed or 1)
            if pages_difference > 0:
                user.total_pages_processed += pages_difference
                user.save(update_fields=['total_pages_processed'])
            
            logger.info(f"Full document processing completed for document {doc.id}")
            
            return Response({
                "status": "success",
                "message": "Full document processed successfully",
                "pages_processed": pages_processed,
                "progress_messages": progress_messages,
                "usage_info": user.get_usage_info()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in ProcessFullDocumentView: {str(e)}", exc_info=True)
            return Response(
                {"status": "error", "message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
