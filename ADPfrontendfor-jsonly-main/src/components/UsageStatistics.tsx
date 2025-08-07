import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { RootState } from '@/store';
import UserTypeIndicator from './UserTypeIndicator';
import { useUsageStats } from '@/hooks/useUsageStats';

interface UsageStats {
  documents_processed: number;
  max_documents_allowed: number;
  warnings?: string[];
}

const UsageStatistics = () => {
  const { stats } = useUsageStats();
  const usageStats = stats as UsageStats | null;
  const userType = useSelector((state: RootState) => state.auth.userType);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usage Statistics
          <UserTypeIndicator userType={userType} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          {usageStats?.documents_processed}/{usageStats?.max_documents_allowed} documents processed
        </div>
        {usageStats?.warnings?.map((warning: string) => (
          <Alert key={warning} className="mt-2 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default UsageStatistics;
