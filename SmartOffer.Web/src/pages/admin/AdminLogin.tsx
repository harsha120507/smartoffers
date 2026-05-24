import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, isMockAuth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import apiClient from '../../api/apiClient';
import { Lock, Mail, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        // Mock authentication flow for admin
        idToken = `mock-${email}:${email.split('@')[0]}`;
        localStorage.setItem('token', idToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

        // Fetch user details and role from backend
        const res = await apiClient.get('/auth/me');
        dbUser = res.data;
      } else {
        // 1. Sign in via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 2. Retrieve Firebase ID Token
        idToken = await firebaseUser.getIdToken();
        localStorage.setItem('token', idToken);

        // Set temporarily in apiClient headers for the immediate role lookup
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

        // 3. Fetch user details and role from backend
        const res = await apiClient.get('/auth/me');
        dbUser = res.data;
      }

      // 4. Strict check: User must be an Admin
      if (dbUser.role !== 'Admin') {
        // Log out immediately if standard user tries to enter Admin console
        if (!isMockAuth) {
          await auth.signOut();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete apiClient.defaults.headers.common['Authorization'];
        setError('Access denied. You do not have administrator permissions.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(dbUser));
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (!isMockAuth) {
        await auth.signOut();
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setError(err.response?.data?.message || err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative overflow-hidden px-4 py-8">
      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft size={16} /> Back to Deals
      </Link>

      {/* Background Mesh */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-indigo-200 dark:border-indigo-900/30">
            <KeyRound size={24} />
          </div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight mt-4">
            Admin Access
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            SmartOffer Business Console
          </p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-2"
          >
            <ShieldAlert size={16} /> {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm"
                  placeholder="admin@smartoffer.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 rounded-2xl shadow-xl shadow-indigo-500/20 transition duration-300 transform hover:-translate-y-0.5 mt-2 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold tracking-wider uppercase">
          Requires an Admin Account in PostgreSQL
        </div>
      </motion.div>
    </div>
  );
}
