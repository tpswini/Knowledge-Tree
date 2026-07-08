import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useContext(AuthContext);
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setSuccess('');
    setError('');
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, { email });
      setSuccess('Verification code resent! Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-[400px] overflow-hidden relative p-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-8 text-sm">
            We've sent a 6-digit code to <br/>
            <span className="font-bold text-gray-800">{email}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 text-sm font-medium animate-in fade-in slide-in-from-top-2 text-left">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-3 border border-emerald-100 text-sm font-medium animate-in fade-in slide-in-from-top-2 text-left">
              <ShieldCheck size={18} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input 
                type="text" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-4 text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#1a472a] focus:bg-white transition-all text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                placeholder="------"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#1a472a]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm font-semibold text-gray-500 hover:text-[#1a472a] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={resendLoading ? "animate-spin" : ""} />
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
            
            <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
