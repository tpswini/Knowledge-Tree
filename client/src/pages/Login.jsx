import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.unverified) {
        setIsUnverified(true);
      }
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess('');
    setError('');
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, { email });
      setResendSuccess('Verification email resent! Please check your inbox.');
      setIsUnverified(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] font-sans">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex w-1/2 bg-[#1a472a] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 text-white/5">
          <Leaf size={400} />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Tree</h1>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-bold mb-6 leading-tight">Welcome back to your forest.</h2>
          <p className="text-emerald-100 text-lg mb-8 opacity-90">Every card you study adds a leaf to your tree. Watch your knowledge grow as you water it every day.</p>
          <div className="flex gap-4 items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-fit">
             <div className="text-4xl">🔥</div>
             <div>
                <p className="font-bold text-lg">Daily Streak</p>
                <p className="text-emerald-200 text-sm">Log in daily to earn bonus XP!</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div className="bg-[#1a472a] text-white p-2 rounded-xl">
            <Leaf size={20} />
          </div>
          <h1 className="text-xl font-bold text-[#1a472a] tracking-tight">Knowledge Tree</h1>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-2">
              Welcome Back! <Leaf className="text-[#1a472a]" size={28} fill="currentColor" />
            </h2>
            <p className="text-gray-500">Login to continue your learning journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          {resendSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-3 border border-emerald-100 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={18} />
              {resendSuccess}
            </div>
          )}

          {isUnverified && (
            <button 
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full mb-6 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Mail size={16} />
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-[#1a472a] hover:text-[#1a472a]/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#1a472a]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1a472a] font-bold hover:underline">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
