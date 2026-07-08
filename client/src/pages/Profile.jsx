import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Calendar, Download, FileText, FileJson, Award, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch stats and achievements
        const [dashRes, achRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/achievements`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setSummary(dashRes.data);
        setAchievements(achRes.data);
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const exportData = async (format) => {
    try {
      const token = localStorage.getItem('token');
      // Just fetch all cards for export
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cards = res.data;

      if (format === 'json') {
        const dataStr = JSON.stringify(cards, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge_tree_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'markdown') {
        let md = `# Knowledge Tree Export\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
        cards.forEach(c => {
          md += `## ${c.title}\n`;
          md += `- **Category:** ${c.category || 'N/A'}\n`;
          md += `- **Difficulty:** ${c.difficulty || 'N/A'}\n`;
          md += `- **Tags:** ${c.tags || 'None'}\n\n`;
          md += `### Explanation\n${c.explanation}\n\n`;
          if (c.source) md += `**Source:** ${c.source}\n\n`;
          md += `---\n\n`;
        });
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge_tree_export_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        // Simple front-end print approach for PDF
        // Creates a hidden iframe, writes HTML, and calls print()
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const contentWindow = iframe.contentWindow;
        contentWindow.document.open();
        contentWindow.document.write(`
          <html>
            <head>
              <title>Knowledge Tree Export</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #111827; }
                h1 { color: #1a472a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                .card { margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
                h2 { margin-top: 0; color: #1f2937; }
                .meta { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
                .explanation { white-space: pre-wrap; line-height: 1.6; }
              </style>
            </head>
            <body>
              <h1>Knowledge Tree Export</h1>
              ${cards.map(c => `
                <div class="card">
                  <h2>${c.title}</h2>
                  <div class="meta">
                    Category: ${c.category || 'N/A'} | Difficulty: ${c.difficulty || 'N/A'}
                  </div>
                  <div class="explanation">${c.explanation || ''}</div>
                  ${c.source ? `<p><strong>Source:</strong> ${c.source}</p>` : ''}
                </div>
              `).join('')}
            </body>
          </html>
        `);
        contentWindow.document.close();
        contentWindow.focus();
        contentWindow.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1a472a]" size={40} /></div>;
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full bg-[#e8f3ec] text-[#1a472a] flex items-center justify-center text-5xl font-bold shadow-inner">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-medium mb-6">
            <span className="flex items-center gap-1.5"><Mail size={16} /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined Recently</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-gray-900">{summary?.stats?.totalCards || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Total Cards</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-gray-900">{summary?.stats?.studyHours || 0}h</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Study Hours</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-emerald-600">Lvl {user?.level || 1}</span>
              <span className="text-xs text-emerald-600/70 uppercase tracking-wide">{user?.xp || 0} XP</span>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-orange-600">{user?.learningStreak || 0}</span>
              <span className="text-xs text-orange-600/70 uppercase tracking-wide">🔥 Growing Streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Achievements Expanded List */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-orange-500" size={24} /> Unlocked Achievements
            </h2>
            <span className="text-sm font-bold text-gray-400">{unlockedAchievements.length} Unlocked</span>
          </div>
          
          {unlockedAchievements.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {unlockedAchievements.map(ach => (
                <div key={ach.id} className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  <Award className="text-[#1a472a] mb-2" size={32} />
                  <span className="text-sm font-bold text-[#1a472a] leading-tight mb-1">{ach.title}</span>
                  <span className="text-xs text-[#1a472a]/70">{ach.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
              <Award size={48} className="mb-2 opacity-20" />
              <p className="text-sm">No achievements unlocked yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Profile;
