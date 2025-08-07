import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProcessingProgress from './ProcessingProgress';
import { apiService } from '@/services/apiService';
import { handleError } from '@/lib/utils';

interface Props {
  documentId: string;
  onSuccess: (result: unknown) => void;
}

const FullDocumentProcessor = ({ documentId, onSuccess }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  const processFullDocument = async () => {
    setIsProcessing(true);
    try {
      const result = await apiService.processFullDocument(documentId);
      setProgress(result.progress_messages);
      onSuccess(result);
      toast.success('Full document processed successfully!');
    } catch (error) {
      handleError(error, 'Failed to process full document');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-yellow-800">Partial Document Processed</h3>
          <p className="text-sm text-yellow-700">Only first 3 pages were processed. Load full document?</p>
        </div>
        <Button onClick={processFullDocument} disabled={isProcessing} className="bg-yellow-600 hover:bg-yellow-700">
          {isProcessing ? 'Processing...' : 'Load Full Document'}
        </Button>
      </div>
      {isProcessing && (
        <ProcessingProgress
          progressMessages={progress}
          isVisible={isProcessing}
        />
      )}
    </div>
  );
};

export default FullDocumentProcessor;
