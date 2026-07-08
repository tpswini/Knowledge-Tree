import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Leaf, Sun, Moon, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { token, newPassword: password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex w-full bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* Left Panel - Image & Branding */}
      <div 
        className="hidden md:flex lg:w-1/2 relative flex-col justify-between p-6 bg-cover bg-center h-full" 
        style={{ backgroundImage: "url('/knowledge_tree_bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-black/40 mix-blend-multiply"></div>
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="text-[#1a472a]">
            <Leaf size={32} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a472a] tracking-tight">Knowledge Tree</h1>
            <p className="text-[#1a472a]/80 text-xs font-medium">Grow Knowledge. Grow Yourself.</p>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="relative z-10 bg-[#e8f3ec]/95 backdrop-blur-md p-6 rounded-2xl border border-[#d1e6d9] max-w-sm shadow-xl self-center lg:self-start w-full lg:w-auto">
          <div className="flex items-start gap-3">
            <Leaf className="text-[#1a472a] mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-lg font-bold text-[#1a472a] mb-1.5 leading-tight">
                Secure your account.
              </h3>
              <p className="text-[#1a472a]/80 text-xs">
                Create a strong new password to protect your Knowledge Tree.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col relative p-4 h-full bg-[#f8fafc]">
        
        {/* Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden z-10 scale-90">
          <button className="p-1.5 bg-white text-gray-500 hover:text-gray-800 transition-colors">
            <Sun size={16} />
          </button>
          <button className="p-1.5 bg-[#0f172a] text-white transition-colors">
            <Moon size={16} />
          </button>
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-4 mt-2">
          <Leaf size={24} className="text-[#1a472a]" fill="currentColor" />
          <h1 className="text-xl font-bold text-[#1a472a] tracking-tight">Knowledge Tree</h1>
        </div>

        {/* Center content wrapper */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0">
          <div className="w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 py-6 px-8">
            
            <div className="flex flex-col items-start mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Reset Password
              </h2>
              <p className="text-gray-500 text-sm">Create a new secure password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                {error}
              </div>
            )}

            {message ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-4 text-[#1a472a]">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset!</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>
                <Link to="/login" className="inline-block px-6 py-2.5 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white rounded-lg text-sm font-medium transition-colors">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder="••••••••"
                      required
                      minLength="6"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder="••••••••"
                      required
                      minLength="6"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-2.5 mt-2 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-[#1a472a]/20 flex items-center justify-center disabled:opacity-70"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center w-full pb-2 pt-2 shrink-0">
          <p className="text-gray-400 text-[11px] flex items-center gap-1.5">
            <Leaf size={10} className="text-[#1a472a]" fill="currentColor" />
            © {new Date().getFullYear()} Knowledge Tree. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
