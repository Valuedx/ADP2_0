import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, Upload, Settings } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { RootState } from '@/store';
import useBranding from '@/shared/hooks/useBranding';
import UserProfile from './UserProfile';
import UsageBadge from './UsageBadge';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const branding = useBranding();
  const userType = useSelector((state: RootState) => state.auth.userType);
  const documentsProcessed = useSelector((state: RootState) => state.auth.documentsProcessed);
  const maxDocuments = useSelector((state: RootState) => state.auth.maxDocumentsAllowed);

  return (
    <nav className="border-b w-full">
      <div className="flex items-center justify-between w-full px-4 py-3">
        <div className="flex items-center gap-4">
          <img src={branding.logo} alt="Logo" className="h-10 w-auto" />
          {userType === 'default' && (
            <UsageBadge current={documentsProcessed} max={maxDocuments} className="ml-4" />
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/uploaddoc')}>
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </Button>

          <Button variant="ghost" onClick={() => navigate('/userdashboard')}>
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Dashboard
          </Button>

          {userType === 'admin' && (
            <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
              <Settings className="h-5 w-5 mr-2" />
              Admin
            </Button>
          )}

          <UserProfile />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
