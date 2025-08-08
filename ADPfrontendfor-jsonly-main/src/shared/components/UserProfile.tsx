import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserCircle } from 'lucide-react';
import { clearAuthData } from '@/store/authSlice';
import { clearDocumentData } from '@/store/documentSlice';
import type { RootState } from '@/store';
import { FiLogOut } from 'react-icons/fi';

const UserProfile = () => {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const name = useSelector((state: RootState) => state.auth.username) || 'User';
  const userType = useSelector((state: RootState) => state.auth.userType) || '';

  const handleLogout = () => {
    dispatch(clearAuthData());
    dispatch(clearDocumentData());
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="flex items-center gap-2">
        <UserCircle className="h-5 w-5" />
      </button>
      {show && (
        <div className="absolute top-8 right-0 w-72 bg-white shadow-lg rounded-lg p-5 border border-gray-200 z-50 text-center">
          <UserCircle className="h-10 w-10 mx-auto text-gray-600 mb-1" />
          <div className="mb-3">
            <p className="text-base font-semibold text-gray-800" title={name}>{name}</p>
            <p className="text-sm text-gray-500" title={userType}>{userType}</p>
          </div>
          <hr className="my-2 border-gray-300" />
          <button
            onClick={handleLogout}
            className="mx-auto mt-2 flex items-center justify-center gap-2 px-4 py-1.5 text-sm text-red-600 font-medium border border-red-200 rounded-md hover:bg-red-50 transition"
          >
            <FiLogOut className="text-base" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
