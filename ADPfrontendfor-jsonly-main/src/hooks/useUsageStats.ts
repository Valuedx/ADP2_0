import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { updateUsageStats } from '@/store/authSlice';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useUsageStats = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const { handleError } = useErrorHandler();

  const fetchUsageStats = useCallback(async () => {
    try {
      const data = await apiService.getUsageStats();
      setStats(data);

      dispatch(updateUsageStats(data));
    } catch (error) {
      handleError(error as { status?: number; message?: string }, 'Failed to fetch usage stats');
    }
  }, [dispatch, handleError]);

  useEffect(() => {
    if (accessToken) {
      fetchUsageStats();
      const interval = setInterval(fetchUsageStats, 30000);
      return () => clearInterval(interval);
    }
  }, [accessToken, fetchUsageStats]);

  return { stats, refetch: fetchUsageStats };
};
