import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Trophy, Zap, BookOpen, Flame, Clock, Target, Plus, ChevronRight, Star, TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { subYears } from 'date-fns';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1a472a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  const { stats, charts, recentCards, motivationalSummary } = summary;
  const userData = summary.user;

  // Colors for charts
  const COLORS = ['#1a472a', '#2c7a4b', '#4ade80', '#86efac', '#dcfce7'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Motivational Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌳 Welcome back, {userData.name.split(' ')[0]}! Let's grow your knowledge today.</h1>
          <p className="text-gray-500 text-sm mt-1">{motivationalSummary}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/journal" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm">
            Log Journal
          </Link>
          <Link to="/cards" className="flex items-center gap-2 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm">
            <Plus size={18} /> 🌱 Plant New Knowledge
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <BookOpen size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.totalCards}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Total Cards</span>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Clock size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.studyHours}h</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Study Hours</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2">
            <Zap size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.avgDailyCards}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Avg Cards/Day</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Target size={20} />
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Goal Success</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
            <Flame size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{userData.learningStreak}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">🔥 Growing Streak</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:border-[#1a472a]/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <Star size={20} fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-gray-900 truncate w-full px-2" title={stats.favoriteCategory}>{stats.favoriteCategory}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Top Category</span>
        </div>
      </div>

      {stats.totalCards === 0 ? (
        <div className="bg-[#eaf4ed] p-10 rounded-3xl border border-[#d3ebd9] text-center shadow-sm flex flex-col items-center justify-center my-8">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-[#1f4a2c] mb-2">Your tree is waiting.</h2>
          <p className="text-[#3b6b4b] mb-8 font-medium">Plant your first piece of knowledge.</p>
          <Link to="/cards" className="inline-flex items-center gap-2 bg-[#1a472a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a472a]/90 transition-colors shadow-sm">
            <Plus size={20} /> Plant New Knowledge
          </Link>
        </div>
      ) : (
        <>
          {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: 30 Day Activity Trend */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <TrendingUp className="text-[#1a472a]" size={20} />
            <h3 className="font-bold text-gray-900">30-Day Learning Trend</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.activityTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} minTickGap={30} />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Line type="monotone" dataKey="cards" name="Cards Added" stroke="#1a472a" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1a472a', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Container for Pie/Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart: Categories */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
              <PieChartIcon className="text-[#1a472a]" size={20} />
              <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
            </div>
            <div className="flex-1 w-full h-48 relative">
              {charts.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.categoryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {charts.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No data</div>
              )}
            </div>
          </div>

          {/* Bar Chart: Difficulty */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
              <BarChart2 className="text-[#1a472a]" size={20} />
              <h3 className="font-bold text-gray-900 text-sm">Difficulty</h3>
            </div>
            <div className="flex-1 w-full h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.difficultyDistribution} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11, fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {charts.difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* GitHub-style Heatmap (5.12) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="text-[#1a472a]" size={20} />
            <h3 className="font-bold text-gray-900">Learning Heatmap</h3>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 365 Days</span>
        </div>
        <div className="min-w-[700px] flex justify-center">
          <ActivityCalendar 
            data={charts.heatmapData.length > 0 ? charts.heatmapData : [{date: new Date().toISOString().split('T')[0], count: 0}]}
            labels={{
              legend: { less: 'Less', more: 'More' },
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              totalCount: '{{count}} cards added in the last year',
            }}
            theme={{
              light: ['#f1f5f9', '#dcfce7', '#86efac', '#22c55e', '#166534'],
              dark: ['#f1f5f9', '#dcfce7', '#86efac', '#22c55e', '#166534'],
            }}
            showWeekdayLabels
            hideColorLegend={false}
            blockMargin={4}
            blockRadius={3}
            blockSize={12}
          />
        </div>
      </div>
      </>
      )}

    </div>
  );
};

export default Dashboard;
