import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiService } from '@/services/apiService';
import { handleError } from '@/shared/utils';
import './FileUploader.css';
import { useSelector, useDispatch } from 'react-redux';
import { setDocumentData } from '@/store/documentSlice';
import { updateUsageStats } from '@/store/authSlice';
import type { RootState } from '@/store';
import ProcessingProgress from './ProcessingProgress';

// Normalize different backend response shapes
type UploadResponse = {
  documentId?: string;
  pagesProcessed?: number;
  isFullDocument?: boolean;
  progressMessages?: string[];
  usageInfo?: unknown;
  canLoadFullDocument?: boolean;
  [key: string]: unknown;
};

const normalizeUploadResponse = (response: unknown): UploadResponse => {
  const data =
    (response as { data?: Record<string, unknown> })?.data ||
    (response as Record<string, unknown>) ||
    {};
  return {
    ...data,
    documentId: (data.document_id ?? data.documentId) as string | undefined,
    pagesProcessed: (data.pages_processed ?? data.pagesProcessed) as
      | number
      | undefined,
    isFullDocument: (data.is_full_document ?? data.isFullDocument) as
      | boolean
      | undefined,
    progressMessages: (data.progress_messages ?? data.progressMessages ?? []) as
      string[],
    usageInfo: data.usage_info ?? data.usageInfo,
    canLoadFullDocument: (data.can_load_full_document ??
      data.canLoadFullDocument) as boolean | undefined,
  };
};

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader = ({ onFileUpload }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [doc_type, setDocType] = useState('docextraction'); // ✅ State with correct name
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userType = useSelector((state: RootState) => state.auth.userType);
  const documentsProcessed = useSelector((state: RootState) => state.auth.documentsProcessed);
  const maxDocuments = useSelector((state: RootState) => state.auth.maxDocumentsAllowed);

  const [showPageLimitWarning, setShowPageLimitWarning] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  const canUpload =
    userType !== 'default' ||
    documentsProcessed < (maxDocuments || Infinity);

  useEffect(() => {
    if (userType === 'default') {
      setShowPageLimitWarning(true);
    }
  }, [userType]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!canUpload) {
      handleError({ status: 403, message: 'document limit' });
      return;
    }

    setIsUploading(true);
    setShowProgress(true);
    setProgressMessages(['Starting document processing...']);

    try {
      const rawResponse = prompt.trim()
        ? await apiService.uploadDocument(
            file,
            doc_type,
            false,
            prompt
          )
        : await apiService.uploadDocument(
            file,
            doc_type
          );
      onFileUpload(file);

      const response = normalizeUploadResponse(rawResponse);

      if (response && response.documentId) {
        const documentId = String(response.documentId);
        if (response.progressMessages) {
          setProgressMessages(response.progressMessages);
        }
        dispatch(
          setDocumentData({
            documentId,
            documentData: {
              ...response,
              pagesProcessed: response.pagesProcessed,
              isFullDocument: response.isFullDocument,
              progressMessages: response.progressMessages,
            },
          })
        );

        if (response.usageInfo) {
          dispatch(updateUsageStats(response.usageInfo));
        }

        toast.success(
          `Document processed successfully! ${response.pagesProcessed} pages processed.`
        );
        navigate(`/document/${documentId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      handleError(error, 'Upload failed', navigate);
    } finally {
      setIsUploading(false);
      setShowProgress(false);
      setProgressMessages([]);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (file.size > 10 * 1024 * 1024) {
        handleError({ message: 'File size exceeds the 10MB limit.' });
        return;
      }

      await processFile(file);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        handleError({ message: 'File size exceeds the 10MB limit.' });
        return;
      }

      await processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleDocTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDocType(e.target.value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {showPageLimitWarning && (
        <div className="mb-4 text-sm text-orange-700 bg-orange-50 p-2 rounded">
          Only the first 3 pages will be processed.
        </div>
      )}
      {/* Doc Type Radio Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Document Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="docextraction"
              checked={doc_type === 'docextraction'}
              onChange={handleDocTypeChange}
            />
            Document Extraction
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="Bill Reimbursment"
              checked={doc_type === 'Bill Reimbursment'}
              onChange={handleDocTypeChange}
            />
            Bill Reimbursment
          </label>
        </div>
      </div>

      {/* Prompt input area */}
      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          Processing Instructions (optional)
        </label>
        <textarea
          id="prompt"
          className="w-full p-3 border rounded-md min-h-24 text-sm"
          placeholder="Enter instructions for how to process this document..."
          value={prompt}
          onChange={handlePromptChange}
        />
      </div>

      {/* File drop area */}
      <div
        className={`drop-area flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-primary/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Drag & Drop your file here</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Support for PDF, DOCX, JPG, PNG (max 10MB)
        </p>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          {isUploading ? "Uploading..." : "Select File"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Loading indicator */}
      {isUploading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-r-transparent mr-2"></div>
          <span>Processing your document...</span>
        </div>
      )}

      <ProcessingProgress isVisible={showProgress} progressMessages={progressMessages} />

    </div>
  );
};

export default FileUploader;
