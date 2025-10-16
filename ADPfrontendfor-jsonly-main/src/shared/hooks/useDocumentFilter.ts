import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

export const useDocumentFilter = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const filterDocuments = async (userId: string, date: string) => {
    setLoading(true);
    try {
      const data = await apiService.filterDocuments(userId, date);
      // Debug: log server response so we can see whether htmlData is present
      // eslint-disable-next-line no-console
      console.debug('filterDocuments response', data);

      const resp: any = data as any;
      const docsWithStringId = (resp.documents || []).map((doc: any) => ({
        ...doc,
        // If id is numeric, convert to string; if already a string (e.g. encrypted), keep as-is
        id: typeof doc.id === 'number' ? String(doc.id) : doc.id,
      }));

      setDocuments(docsWithStringId);
    } catch (error) {
      handleError(error as { status?: number; message?: string }, 'Failed to filter documents');
    } finally {
      setLoading(false);
    }
  };

  return { documents, filterDocuments, loading };
};
