import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Loader2, Leaf } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="p-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-[#1a472a] text-white p-3 rounded-2xl shadow-lg shadow-[#1a472a]/20">
              <Leaf size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>

          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="animate-spin text-[#1a472a] mb-4" size={40} />
              <p className="text-gray-500">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6 flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
              <p className="text-gray-700 mb-8">{message}</p>
              <Link 
                to="/login"
                className="w-full py-3 bg-[#1a472a] hover:bg-[#1a472a]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#1a472a]/20 block"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <p className="text-red-600 font-medium mb-8">{message}</p>
              <Link 
                to="/login"
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition-all block"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
