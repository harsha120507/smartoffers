import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, isMockAuth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import apiClient from '../../api/apiClient';
import { Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let idToken = '';
      let dbUser: any = null;

      if (isMockAuth) {
        // Mock authentication flow for demo purposes
        idToken = `mock-${email}:${email.split('@')[0]}`;
        localStorage.setItem('token', idToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

        // Fetch user profile and role from the backend
        const res = await apiClient.get('/auth/me');
        dbUser = res.data;
      } else {
        // 1. Sign in via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 2. Retrieve Firebase ID Token
        idToken = await firebaseUser.getIdToken();
        localStorage.setItem('token', idToken);

        // Set temporarily in apiClient headers for the immediate call
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

        // 3. Fetch user profile and role from the backend
        const res = await apiClient.get('/auth/me');
        dbUser = res.data;
      }

      localStorage.setItem('user', JSON.stringify(dbUser));
      setSuccess(true);

      setTimeout(() => {
        if (dbUser.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err: any) {
      // Sign out of Firebase if login sync fails
      if (!isMockAuth) {
        await auth.signOut();
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] relative overflow-hidden px-4 py-8">
      {/* Background Mesh */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">
            Sign In
          </h2>
          <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Access your SmartOffer account
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-2">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl flex items-center gap-2">
            <CheckCircle size={16} /> Welcome back! Redirecting...
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleLogin}>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm"
                placeholder="e.g. guest@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 rounded-2xl shadow-xl shadow-indigo-500/20 transition duration-300 transform hover:-translate-y-0.5 mt-4 text-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 space-y-2">
          <div>
            New to SmartOffer?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Create Account
            </Link>
          </div>
          <div>
            Are you a Business Owner?{' '}
            <Link to="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline font-bold">
              Admin Portal →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
