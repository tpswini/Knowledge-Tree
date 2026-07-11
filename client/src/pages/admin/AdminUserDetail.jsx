import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, Calendar, Target, User, Trash2 } from 'lucide-react';
import CardViewModal from '../../components/cards/CardViewModal';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cards');
  const [viewCard, setViewCard] = useState(null);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data.user);
      } catch (error) {
        console.error('Failed to fetch user details', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to delete user', error);
      alert('Failed to delete user. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteUser = () => {
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading user profile...</div>;
  }

  if (!userData) {
    return <div className="text-center py-10 text-red-500">User not found</div>;
  }

  const { cards, journals, goals } = userData;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1a472a] transition-colors font-medium">
          <ArrowLeft size={18} /> Back to Users
        </Link>
        
        <button 
          onClick={handleDeleteUser}
          className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors px-4 py-2 rounded-xl font-medium border border-red-100"
        >
          <Trash2 size={18} /> Delete Profile
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="bg-[#1a472a]/10 p-6 rounded-full">
          <User size={64} className="text-[#1a472a]" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{userData.name}</h2>
          <p className="text-gray-500 mb-4">{userData.email}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500 font-semibold uppercase">Level</div>
              <div className="font-bold text-[#1a472a]">{userData.level}</div>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500 font-semibold uppercase">XP</div>
              <div className="font-bold text-[#1a472a]">{userData.xp}</div>
            </div>
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
              <div className="text-xs text-orange-600 font-semibold uppercase">Streak</div>
              <div className="font-bold text-orange-700">{userData.learningStreak} Days</div>
            </div>
          </div>
        </div>
        <div className="text-center md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
          <div className="text-xs text-gray-500 font-semibold mb-2">ACCOUNT STATS</div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Joined</span>
            <span className="text-sm font-medium">{new Date(userData.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Active</span>
            <span className="text-sm font-medium">{userData.lastActiveDate ? new Date(userData.lastActiveDate).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('cards')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'cards' ? 'border-[#1a472a] text-[#1a472a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <BookOpen size={18} /> Cards ({cards.length})
        </button>
        <button 
          onClick={() => setActiveTab('journals')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'journals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar size={18} /> Journals ({journals.length})
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'goals' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Target size={18} /> Goals ({goals.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.length === 0 ? <p className="col-span-full text-center text-gray-500 py-10">No cards stored.</p> : null}
            {cards.map(card => (
              <div 
                key={card.id} 
                onClick={() => setViewCard(card)}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{card.title}</h3>
                  {card.category && <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">{card.category}</span>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{card.explanation}</p>
                <div className="text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                  Created: {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'journals' && (
          <div className="space-y-4">
            {journals.length === 0 ? <p className="text-center text-gray-500 py-10">No journals stored.</p> : null}
            {journals.map(journal => (
              <div key={journal.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-blue-50/30">
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-blue-900">{new Date(journal.date).toLocaleDateString()}</span>
                  <span className="text-2xl">{journal.mood}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">What I Learned</h4>
                    <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100">{journal.whatILearned}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Biggest Challenge</h4>
                    <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100">{journal.biggestChallenge}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.length === 0 ? <p className="col-span-full text-center text-gray-500 py-10">No goals stored.</p> : null}
            {goals.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      goal.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      goal.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {goal.status}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{goal.type}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{goal.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{goal.progress}%</div>
                  {goal.deadline && <div className="text-xs text-gray-500">Due: {new Date(goal.deadline).toLocaleDateString()}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600">
                  <Trash2 size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Profile?</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to completely delete <span className="font-semibold text-gray-800">{userData.name}'s</span> profile? This action is permanent and cannot be undone. All associated cards, journals, and goals will also be removed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card View Modal */}
      <CardViewModal
        isOpen={!!viewCard}
        card={viewCard}
        onClose={() => setViewCard(null)}
      />
    </div>
  );
};

export default AdminUserDetail;
