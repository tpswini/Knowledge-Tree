import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, CheckCircle2, Circle, Clock, Trash2, Edit2, X, Loader2 } from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Daily',
    deadline: '',
    status: 'Pending',
    progress: 0
  });

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openModal = (goal = null) => {
    if (goal) {
      setGoalToEdit(goal);
      setFormData({
        title: goal.title,
        type: goal.type,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
        status: goal.status,
        progress: goal.progress
      });
    } else {
      setGoalToEdit(null);
      setFormData({ title: '', type: 'Daily', deadline: '', status: 'Pending', progress: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (goalToEdit) {
        await axios.put(`http://localhost:5000/api/goals/${goalToEdit.id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/goals', formData, { headers });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      alert('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const updateProgress = async (id, newProgress) => {
    try {
      const token = localStorage.getItem('token');
      const status = newProgress === 100 ? 'Completed' : (newProgress === 0 ? 'Pending' : 'In Progress');
      await axios.put(`http://localhost:5000/api/goals/${id}`, { progress: newProgress, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const renderGoalCard = (goal) => {
    return (
      <div key={goal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#1a472a]/20 transition-all group">
        <div className="flex justify-between items-start mb-2">
          <h4 className={`font-bold text-gray-900 ${goal.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>{goal.title}</h4>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openModal(goal)} className="p-1 text-gray-400 hover:text-blue-500"><Edit2 size={14}/></button>
            <button onClick={() => handleDelete(goal.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs font-medium">
          {goal.status === 'Completed' ? (
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12}/> Completed</span>
          ) : goal.status === 'In Progress' ? (
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={12}/> In Progress</span>
          ) : (
            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"><Circle size={12}/> Pending</span>
          )}
          {goal.deadline && (
            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Due {new Date(goal.deadline).toLocaleDateString()}</span>
          )}
        </div>

        {/* Progress Bar & Slider */}
        <div className="space-y-1 mt-auto">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Progress</span>
            <span>{goal.progress}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" step="10"
            value={goal.progress}
            onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a472a]"
          />
        </div>
      </div>
    );
  };

  const dailyGoals = goals.filter(g => g.type === 'Daily');
  const weeklyGoals = goals.filter(g => g.type === 'Weekly');
  const monthlyGoals = goals.filter(g => g.type === 'Monthly');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-[#1a472a]" /> My Goals
          </h1>
          <p className="text-gray-500 text-sm mt-1">Set targets and track your learning progress.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1a472a]"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Daily Column */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
              Daily Targets <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{dailyGoals.length}</span>
            </h3>
            <div className="space-y-3">
              {dailyGoals.map(renderGoalCard)}
              {dailyGoals.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No daily goals set.</p>}
            </div>
          </div>

          {/* Weekly Column */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
              Weekly Targets <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{weeklyGoals.length}</span>
            </h3>
            <div className="space-y-3">
              {weeklyGoals.map(renderGoalCard)}
              {weeklyGoals.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No weekly goals set.</p>}
            </div>
          </div>

          {/* Monthly Column */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
              Monthly Targets <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{monthlyGoals.length}</span>
            </h3>
            <div className="space-y-3">
              {monthlyGoals.map(renderGoalCard)}
              {monthlyGoals.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No monthly goals set.</p>}
            </div>
          </div>

        </div>
      )}

      {/* Goal Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{goalToEdit ? 'Edit Goal' : 'Create Goal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form id="goalForm" onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Goal Title *</label>
                <input 
                  required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a472a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a472a]"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Deadline</label>
                  <input 
                    type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a472a]"
                  />
                </div>
              </div>

              {goalToEdit && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a472a]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Progress (%)</label>
                    <input 
                      type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a472a]"
                    />
                  </div>
                </div>
              )}
            </form>
            
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" form="goalForm" className="bg-[#1a472a] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#1a472a]/90">Save Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
