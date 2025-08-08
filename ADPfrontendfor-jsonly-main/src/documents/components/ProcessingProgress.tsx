import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  isVisible: boolean;
  progressMessages?: string[];
}

const ProcessingProgress = ({ isVisible, progressMessages = [] }: ProcessingProgressProps) => {
  if (!isVisible || !progressMessages.length) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
      <div className="flex items-center mb-3">
        <Loader2 className="animate-spin h-4 w-4 mr-2 text-blue-600" />
        <span className="text-blue-800 font-medium">Processing Document...</span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {progressMessages.map((message, index) => (
          <div key={index} className="text-sm text-blue-700 flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>{message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingProgress;
