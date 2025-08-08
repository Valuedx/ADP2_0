import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { setAuthData, clearAuthData } from '@/store/authSlice';

const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return {
    ...auth,
    setAuthData: (data: Partial<typeof auth>) => dispatch(setAuthData(data)),
    clearAuthData: () => dispatch(clearAuthData()),
  };
};

export default useAuth;
