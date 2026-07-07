import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Plus, Loader2, Save, X, Calendar as CalendarIcon, CheckCircle2, ChevronRight } from 'lucide-react';

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null); // For viewing
  
  const [formData, setFormData] = useState({
    whatILearned: '',
    biggestChallenge: '',
    questions: '',
    tomorrowsGoal: '',
    mood: 'Happy'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJournals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/journals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJournals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/journals`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchJournals();
      setFormData({
        whatILearned: '', biggestChallenge: '', questions: '', tomorrowsGoal: '', mood: 'Happy'
      });
    } catch (err) {
      alert('Failed to save journal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = (journal) => {
    setSelectedJournal(journal);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Book className="text-[#1a472a]" /> Daily Journal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Reflect on your daily progress and learning journey.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Write Entry
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#1a472a]"></div>
        </div>
      ) : journals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#1a472a]">
            <Book size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Journal Entries Yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start reflecting on your learning to build a habit!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[#1a472a] font-semibold hover:underline"
          >
            Write your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map(journal => (
            <div 
              key={journal.id} 
              onClick={() => openViewModal(journal)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#1a472a]/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <CalendarIcon size={16} />
                  {new Date(journal.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <span className="text-2xl" title="Mood">{
                  journal.mood === 'Happy' ? '😊' : 
                  journal.mood === 'Neutral' ? '😐' : 
                  journal.mood === 'Sad' ? '😔' : 
                  journal.mood === 'Frustrated' ? '😤' : '💡'
                }</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 block">Learned</span>
                  <p className="text-sm text-gray-700 line-clamp-2">{journal.whatILearned}</p>
                </div>
                
                {journal.biggestChallenge && (
                  <div>
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1 block">Challenge</span>
                    <p className="text-sm text-gray-700 line-clamp-2">{journal.biggestChallenge}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 group-hover:text-[#1a472a] transition-colors flex items-center gap-1 font-medium">
                  Read full entry <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Book className="text-[#1a472a]" /> New Journal Entry
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form id="journalForm" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">What did you learn today? *</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.whatILearned}
                  onChange={(e) => setFormData({...formData, whatILearned: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">What was your biggest challenge?</label>
                <textarea 
                  rows="2"
                  value={formData.biggestChallenge}
                  onChange={(e) => setFormData({...formData, biggestChallenge: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Any open questions or confusions?</label>
                <textarea 
                  rows="2"
                  value={formData.questions}
                  onChange={(e) => setFormData({...formData, questions: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">What is your goal for tomorrow?</label>
                <input 
                  type="text"
                  value={formData.tomorrowsGoal}
                  onChange={(e) => setFormData({...formData, tomorrowsGoal: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">How are you feeling about your progress?</label>
                <select 
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a]"
                >
                  <option value="Happy">Happy 😊</option>
                  <option value="Neutral">Neutral 😐</option>
                  <option value="Frustrated">Frustrated 😤</option>
                  <option value="Sad">Sad 😔</option>
                  <option value="Inspired">Inspired 💡</option>
                </select>
              </div>
            </form>
            
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Cancel
              </button>
              <button type="submit" form="journalForm" disabled={isSubmitting} className="flex items-center gap-2 bg-[#1a472a] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#1a472a]/90 disabled:opacity-70">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Entry Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{
                  selectedJournal.mood === 'Happy' ? '😊' : 
                  selectedJournal.mood === 'Neutral' ? '😐' : 
                  selectedJournal.mood === 'Sad' ? '😔' : 
                  selectedJournal.mood === 'Frustrated' ? '😤' : '💡'
                }</span>
                <div>
                  <h2 className="font-bold text-gray-900">Journal Entry</h2>
                  <p className="text-sm text-gray-500">{new Date(selectedJournal.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJournal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">What I Learned</h4>
                <div className="bg-green-50/50 p-4 rounded-xl text-gray-800 border border-green-100">{selectedJournal.whatILearned}</div>
              </div>
              
              {selectedJournal.biggestChallenge && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Biggest Challenge</h4>
                  <div className="bg-orange-50/50 p-4 rounded-xl text-gray-800 border border-orange-100">{selectedJournal.biggestChallenge}</div>
                </div>
              )}
              
              {selectedJournal.questions && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Open Questions</h4>
                  <div className="bg-blue-50/50 p-4 rounded-xl text-gray-800 border border-blue-100">{selectedJournal.questions}</div>
                </div>
              )}
              
              {selectedJournal.tomorrowsGoal && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tomorrow's Goal</h4>
                  <div className="bg-purple-50/50 p-4 rounded-xl text-gray-800 border border-purple-100 font-medium flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-purple-400" /> {selectedJournal.tomorrowsGoal}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Journal;
