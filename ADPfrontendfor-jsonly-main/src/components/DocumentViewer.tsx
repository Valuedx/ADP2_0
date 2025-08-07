import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Image, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import type { RootState } from '@/store';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import config from '@/config';

interface DocumentData {
  filepath: string;
  filename?: string;
  originalFilename?: string;
  jsonData?: Record<string, unknown> | null;
  pagesProcessed?: number;
  isFullDocument?: boolean;
  inputToken?: number;
  outputToken?: number;
  status?: string;
}

interface DocumentProcessingInfoProps {
  documentData: DocumentData;
}

const DocumentProcessingInfo: React.FC<DocumentProcessingInfoProps> = ({ documentData }) => {
  return (
    <div className="bg-gray-50 border rounded-lg p-3 mb-4">
      <h3 className="font-medium text-gray-900 mb-2">Processing Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Pages Processed:</span>
          <span className="ml-2 font-medium">{documentData.pagesProcessed || 'Unknown'}</span>
        </div>
        <div>
          <span className="text-gray-600">Processing Type:</span>
          <span className="ml-2">
            {documentData.isFullDocument ? (
              <span className="text-green-600 font-medium">Full Document</span>
            ) : (
              <span className="text-orange-600 font-medium">Partial (3 pages)</span>
            )}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Input Tokens:</span>
          <span className="ml-2 font-medium">{documentData.inputToken || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-600">Output Tokens:</span>
          <span className="ml-2 font-medium">{documentData.outputToken || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

const DocumentViewer: React.FC = () => {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab] = useState<'html'>('html');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percent
  const isDragging = useRef(false);
  const navigate = useNavigate();
  const reduxDocumentId = useSelector(
    (state: RootState) => state.document.documentId
  );
  const userType = useSelector((state: RootState) => state.auth.userType);
  const [processingFull, setProcessingFull] = useState(false);
  const { handleError } = useErrorHandler();

  const fetchDocumentData = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const data: DocumentData = await apiService.getDocument(id);
      setDocumentData(data);
    } catch (err: unknown) {
      handleError(err, 'Failed to fetch document');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const handleProcessFullDocument = async () => {
    if (!documentId) return;
    setProcessingFull(true);
    try {
      await apiService.processFullDocument(documentId);
      toast.success('Full document processed successfully!');
      await fetchDocumentData(documentId);
    } catch (err) {
      handleError(err, 'Failed to process full document');
    } finally {
      setProcessingFull(false);
    }
  };

  useEffect(() => {
    if (reduxDocumentId) {
      setDocumentId(reduxDocumentId);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id') || window.location.pathname.split('/').pop();

    if (urlId) {
      setDocumentId(urlId);
      return;
    }

    const localStorageKeys = Object.keys(localStorage);
    const documentKey = localStorageKeys.find(key => key.startsWith('document_'));

    if (documentKey) {
      try {
        const storedData = JSON.parse(localStorage.getItem(documentKey));
        if (storedData?.documentId) {
          setDocumentId(String(storedData.documentId));
        }
      } catch (e) {
        handleError(e as { status?: number; message?: string }, 'Error parsing localStorage data');
      }
    }
  }, [reduxDocumentId, handleError]);

  useEffect(() => {
    if (!documentId) {
      handleError({ message: 'No document ID found' });
      setLoading(false);
      return;
    }

    fetchDocumentData(documentId);
  }, [documentId, handleError, fetchDocumentData]);

  const getFileExtension = (filepath) => {
    if (!filepath) return '';
    return filepath.split('.').pop().toLowerCase();
  };

  const isImage = (filepath) => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(getFileExtension(filepath));
  const isPDF = (filepath) => getFileExtension(filepath) === 'pdf';

  const renderDocument = () => {
    if (!documentData?.filepath) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No document available</p>
          </div>
        </div>
      );
    }

    const filepath = documentData.filepath;
    const fullUrl = filepath.startsWith('http') ? filepath : `${config.IMG_BASE_URL}${filepath}`;

    if (isImage(filepath)) {
      return (
        <div className="h-full overflow-auto bg-gray-50 rounded-lg p-4">
          <img src={fullUrl} alt="Document" className="max-w-full h-auto mx-auto shadow-lg rounded" />
        </div>
      );
    } else if (isPDF(filepath)) {
      return (
        <div className="h-full bg-gray-50 rounded-lg">
          <iframe src={fullUrl} className="w-full h-full rounded-lg" title="PDF Document" />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Unsupported file type</p>
            <p className="text-sm text-gray-400">{getFileExtension(filepath).toUpperCase()}</p>
          </div>
        </div>
      );
    }
  };

  const getDisplayFilename = () => {
    return (
      documentData?.filename ||
      documentData?.originalFilename ||
      documentData?.filepath?.split('/').pop()
    );
  };

  const handleDownloadJSON = () => {
  const json = documentData?.jsonData;
  if (!json) return;

  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  const name = getDisplayFilename()?.split('.')[0] || `document_${documentId}`;
  a.download = `${name}_data.json`;

  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
};


  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const percentage = (e.clientX / window.innerWidth) * 100;
    if (percentage > 20 && percentage < 80) {
      setLeftPanelWidth(percentage);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 transition"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center space-x-4">
              {documentData?.inputToken && (
                <span className="text-sm text-gray-600">
                  Input Tokens: <strong>{documentData.inputToken}</strong>
                </span>
              )}
              {documentData?.outputToken && (
                <span className="text-sm text-gray-600">
                  Output Tokens: <strong>{documentData.outputToken}</strong>
                </span>
              )}
              {documentData?.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  documentData.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {documentData.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6">
        {documentData && <DocumentProcessingInfo documentData={documentData} />}
        <div className="flex h-[calc(100vh-8rem)] border rounded overflow-hidden relative">
          <div style={{ width: `${leftPanelWidth}%` }} className="bg-blue-100 p-4 rounded-l-lg shadow-md overflow-auto">
            <div className="flex items-center justify-start gap-2 mb-4">
              <span className="inline-flex items-center">
                <Image className="w-5 h-5 text-gray-600" />
              </span>
              <h2 className="text-lg font-semibold text-gray-800 m-0 leading-tight">Document</h2>
              {getDisplayFilename() && (
                <span className="ml-auto text-sm text-gray-500 truncate max-w-[200px]">
                  {getDisplayFilename()}
                </span>
              )}
            </div>

            <div className="h-[calc(100%-3rem)]">{renderDocument()}</div>
          </div>

          <div
            className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize"
            onMouseDown={() => (isDragging.current = true)}
          ></div>

          <div style={{ width: `${100 - leftPanelWidth}%` }} className="bg-green-100 p-4 rounded-r-lg shadow-md overflow-auto">
            <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center">
      <FileText className="w-5 h-5 text-gray-600" />
    </span>
    <h2 className="text-lg font-semibold text-gray-800 m-0 leading-tight">Extracted Data</h2>
  </div>
              <div className="flex items-center gap-2 relative">
                {documentData && !documentData.isFullDocument && (userType === 'power' || userType === 'admin') && (
                  <button
                    onClick={handleProcessFullDocument}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                    disabled={processingFull}
                  >
                    {processingFull ? 'Processing...' : 'Process Full Document'}
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                >
                  Download <ChevronDown size={16} />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded z-10">
                    <button
                      onClick={() => {
                        handleDownloadJSON();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Download JSON
                    </button>
                  </div>
                )}

              </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[500px] min-h-[300px] rounded border p-3 bg-gray-50">
              {documentData?.jsonData ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {JSON.stringify(documentData.jsonData, null, 2)}
                </pre>
              ) : (
                <div className="text-gray-500 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No JSON data available</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
