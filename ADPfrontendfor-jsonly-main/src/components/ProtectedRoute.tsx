import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const userType = useSelector((state: RootState) => state.auth.userType);

  if (requiredUserType && userType !== requiredUserType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need {requiredUserType} privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
