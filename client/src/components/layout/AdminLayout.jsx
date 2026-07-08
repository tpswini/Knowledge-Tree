import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';

const AdminLayout = () => {
  const adminToken = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  if (!adminToken) {
    return <Navigate to="/admin/login" />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#1a472a] text-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert size={24} className="text-emerald-400" />
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
