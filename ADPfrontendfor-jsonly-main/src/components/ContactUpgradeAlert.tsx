import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const ContactUpgradeAlert = ({ userStats }) => {
  const hostname = window.location.hostname;
  const contactEmail = hostname === "adp.automationedge.com"
    ? "plg@automationedge.com"
    : "plg@valuedx.com";

  const [emailSent, setEmailSent] = useState(false);

  const sendUpgradeRequest = () => {
    const subject = encodeURIComponent('Upgrade Request - Power User Access');
    const body = encodeURIComponent(`
Hello,

I would like to upgrade my account to Power User for unlimited document processing.

Current Usage:
- Documents Processed: ${userStats.documents_processed}/${userStats.max_documents_allowed}
- Account Type: ${userStats.userType}

Please let me know the next steps.

Thank you!
    `);

    window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`);
    setEmailSent(true);
  };

  return (
    <Alert className="mt-4 border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Document Limit Reached</AlertTitle>
      <AlertDescription>
        You've reached your limit of {userStats.max_documents_allowed} documents.
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={sendUpgradeRequest}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {emailSent ? 'Email Sent!' : 'Request Upgrade'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`mailto:${contactEmail}`)}
          >
            Contact Support
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ContactUpgradeAlert;
