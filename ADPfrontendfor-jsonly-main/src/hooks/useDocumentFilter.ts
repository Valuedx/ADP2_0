import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useDocumentFilter = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const filterDocuments = async (userId: string, date: string) => {
    setLoading(true);
    try {
      const data = await apiService.filterDocuments(userId, date);
      const docsWithStringId = data.documents?.map((doc: { id: number }) => ({
        ...doc,
        id: String(doc.id),
      })) ?? [];
      setDocuments(docsWithStringId);
    } catch (error) {
      handleError(error as { status?: number; message?: string }, 'Failed to filter documents');
    } finally {
      setLoading(false);
    }
  };

  return { documents, filterDocuments, loading };
};
