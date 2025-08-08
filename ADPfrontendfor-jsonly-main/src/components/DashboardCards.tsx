import { type ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Download, File, AlertCircle } from "lucide-react";
import './DashboardCards.css';

import { useSelector } from "react-redux";
import type { RootState } from '../store/index';
import { Alert, AlertDescription } from "@/components/ui/alert";
import ContactUpgradeAlert from "./ContactUpgradeAlert";
import { useUsageStats } from '@/hooks/useUsageStats';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface DashboardStat {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}

interface DocumentInfo {
  entryDate: string;
}

const DashboardCards = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const { stats: usageStats } = useUsageStats();
  const userType = useSelector((state: RootState) => state.auth.userType);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const { handleError } = useErrorHandler();


  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        const data = await apiService.listDocuments();

        if (data.documents) {
          const totalDocuments = data.documents.length;
          const today = new Date().toISOString().split('T')[0];
          const uploadedToday = data.documents.filter((doc: DocumentInfo) => doc.entryDate === today).length;

          const downloaded = 0;
          const pending = 0;

          const newStats: DashboardStat[] = [
            {
              title: 'Total Documents',
              value: String(totalDocuments),
              icon: <FileText className="h-5 w-5 text-blue-500" />,
              description: 'Documents processed',
            },
            {
              title: 'Uploaded Today',
              value: String(uploadedToday),
              icon: <Upload className="h-5 w-5 text-green-500" />,
              description: 'New documents',
            },
            {
              title: 'Downloaded',
              value: String(downloaded),
              icon: <Download className="h-5 w-5 text-purple-500" />,
              description: 'JSON files',
            },
            {
              title: 'Pending',
              value: String(pending),
              icon: <File className="h-5 w-5 text-amber-500" />,
              description: 'Awaiting processing',
            },
          ];

          if (usageStats && userType === 'default') {
            newStats.push({
              title: 'Document Usage',
              value: `${usageStats.documentsProcessed}/${usageStats.maxDocumentsAllowed}`,
              icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
              description: `${usageStats.maxDocumentsAllowed - usageStats.documentsProcessed} remaining`,
            });
          }

          setStats(newStats);
        }
      } catch (error) {
        handleError(error as { status?: number; message?: string }, 'Error fetching dashboard stats');
      }
    };

    fetchData();
  }, [accessToken, userType, usageStats, handleError]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {usageStats?.warnings?.map((warning: string) => (
        <Alert key={warning} className="mt-4 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}

      {userType === 'default' &&
        usageStats?.documentsProcessed >= usageStats?.maxDocumentsAllowed && (
          <ContactUpgradeAlert userStats={usageStats} />
        )}
    </div>
  );
};

export default DashboardCards;
