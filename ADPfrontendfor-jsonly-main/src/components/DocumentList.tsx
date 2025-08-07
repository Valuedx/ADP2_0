import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { RootState } from '@/store';
import { setDocumentData } from '@/store/documentSlice';
import { apiService } from '@/services/apiService';
import { handleError } from '@/lib/utils';

interface Doc {
  id: string;
  filename: string;
  entry_date: string;
  pages_processed: number;
  is_full_document: boolean;
}

interface Props {
  documents: Doc[];
}

const DocumentList = ({ documents }: Props) => {
  const userType = useSelector((state: RootState) => state.auth.userType);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);

  const processFullDocument = async (id: string) => {
    setProcessingDocId(id);
    try {
      await apiService.processFullDocument(id);
      toast.success('Full document processed successfully!');
    } catch (error) {
      handleError(error, 'Failed to process full document');
    } finally {
      setProcessingDocId(null);
    }
  };

  const viewDocument = (doc: Doc) => {
    dispatch(setDocumentData({ documentId: doc.id, documentData: doc }));
    navigate(`/document/${doc.id}`);
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{doc.filename}</h3>
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                <span>📅 {doc.entry_date}</span>
                <span>📄 {doc.pages_processed || 'Unknown'} pages processed</span>
                {!doc.is_full_document && (
                  <span className="text-orange-600">⚠️ Partial document</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!doc.is_full_document && (userType === 'power' || userType === 'admin') && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processingDocId === doc.id}
                  onClick={() => processFullDocument(doc.id)}
                >
                  {processingDocId === doc.id ? 'Processing...' : 'Load Full Document'}
                </Button>
              )}
              <Button size="sm" onClick={() => viewDocument(doc)}>
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
