import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication
    const authToken = sessionStorage.getItem('admin_auth_token');

    // If not authenticated and not currently on the login page (though layout typically wraps protected routes)
    // IMPORTANT: The login route itself should NOT be wrapped in AdminLayout if AdminLayout enforces auth, 
    // OR AdminLayout needs to handle the login route exception.
    // However, usually Login page is separate.
    if (!authToken) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
