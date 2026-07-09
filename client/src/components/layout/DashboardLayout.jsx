import { useContext, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Leaf, LayoutDashboard, Library, Target, Award, LogOut, Menu, Home, TreePine, BookOpen, Clock, Book, X, Brain, User, Download, Moon, Sun } from 'lucide-react';

const DashboardLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Timeline', path: '/timeline', icon: <Clock size={20} /> },
    { name: 'Knowledge Tree', path: '/tree', icon: <TreePine size={20} /> },
    { name: 'Knowledge Cards', path: '/cards', icon: <BookOpen size={20} /> },
    { name: 'Revision', path: '/revision', icon: <Brain size={20} /> },
    { name: 'Daily Journal', path: '/journal', icon: <Book size={20} /> },
    { name: 'My Goals', path: '/goals', icon: <Target size={20} /> },
    { name: 'Achievements', path: '/achievements', icon: <Award size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Export Data', path: '/export', icon: <Download size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/50 mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#1a472a] text-white p-1.5 rounded-lg">
              <Leaf size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Knowledge Tree</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleTheme}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-yellow-400 transition-colors hidden lg:block"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="lg:hidden text-gray-500 dark:text-gray-400 p-1" onClick={() => setIsMobileMenuOpen(false)}>
               <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar pb-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#1a472a] text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#e8f3ec] hover:text-[#1a472a] dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium text-[13px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          
          {/* XP and Level Bar */}
          <div className="px-2 mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-[#e8f3ec] dark:bg-emerald-900/30 text-[#1a472a] dark:text-emerald-400 px-1.5 py-0.5 rounded-md">Lvl {user?.level || 1}</span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{user?.xp || 0} XP</span>
            </div>
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#1a472a] to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, ((user?.xp || 0) % 250) / 250 * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#1a472a]/10 dark:bg-[#1a472a]/30 flex items-center justify-center text-[#1a472a] dark:text-emerald-400 font-bold text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <div className="bg-[#1a472a] text-white p-1.5 rounded-lg">
              <Leaf size={20} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Knowledge Tree</span>
          </div>
          <button 
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
