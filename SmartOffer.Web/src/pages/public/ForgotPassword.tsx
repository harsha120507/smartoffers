import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative overflow-hidden px-4 py-8">
      {/* Back Button */}
      <Link to="/login" className="absolute top-8 left-8 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft size={16} /> Back to Sign In
      </Link>

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
            Reset Password
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Enter your email to receive a recovery link
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-2">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl flex items-center gap-2">
            <CheckCircle size={16} /> Reset link sent! Check your email inbox.
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleReset}>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 rounded-2xl shadow-xl shadow-indigo-500/20 transition duration-300 transform hover:-translate-y-0.5 mt-4 text-sm"
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
