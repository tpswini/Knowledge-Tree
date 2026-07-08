import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, Target, Calendar, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users);
      } catch (error) {
        console.error('Failed to fetch users', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#1a472a] text-white p-3 rounded-xl shadow-md">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Track and manage all registered users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
              <tr>
                <th className="py-4 px-6 font-semibold">User</th>
                <th className="py-4 px-6 font-semibold">Level / XP</th>
                <th className="py-4 px-6 font-semibold">Activity Stats</th>
                <th className="py-4 px-6 font-semibold text-center">Data Stored</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#1a472a]">Level {user.level}</div>
                    <div className="text-xs text-gray-500">{user.xp} XP</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-xs">
                       <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full font-medium"> {user.learningStreak} days</span>
                    </div>
                    <div className="text-xs mt-1 text-gray-400">
                       Last active: {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex flex-col items-center" title="Knowledge Cards">
                        <BookOpen size={16} className="text-emerald-600 mb-1" />
                        <span className="font-medium">{user._count.cards}</span>
                      </div>
                      <div className="flex flex-col items-center" title="Journal Entries">
                        <Calendar size={16} className="text-blue-600 mb-1" />
                        <span className="font-medium">{user._count.journals}</span>
                      </div>
                      <div className="flex flex-col items-center" title="Goals">
                        <Target size={16} className="text-purple-600 mb-1" />
                        <span className="font-medium">{user._count.goals}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => navigate(`/admin/user/${user.id}`)}
                      className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                      View Profile <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
