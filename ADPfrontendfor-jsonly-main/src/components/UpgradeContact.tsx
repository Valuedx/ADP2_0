import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  userType: 'default' | 'power' | 'admin' | null;
  documentsProcessed: number;
  maxDocuments: number;
}

const UpgradeContact = ({ userType, documentsProcessed, maxDocuments }: Props) => {
  const hostname = window.location.hostname;
  const contactEmail = hostname === 'adp.automationedge.com' ? 'plg@automationedge.com' : 'plg@valuedx.com';
  const showUpgradePrompt = userType === 'default' && documentsProcessed >= maxDocuments;
  if (!showUpgradePrompt) return null;
  return (
    <Alert className="border-orange-200 bg-orange-50 mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Document Limit Reached</AlertTitle>
      <AlertDescription>
        You've reached your limit of {maxDocuments} documents. Contact
        <a href={`mailto:${contactEmail}`} className="text-blue-600 underline"> {contactEmail} </a>
        to upgrade to a Power User account for unlimited processing.
      </AlertDescription>
    </Alert>
  );
};

export default UpgradeContact;
