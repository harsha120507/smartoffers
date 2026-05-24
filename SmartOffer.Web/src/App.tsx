import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOffers from './pages/admin/AdminOffers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProfile from './pages/admin/AdminProfile';
import OfferList from './pages/public/OfferList';
import OfferDetail from './pages/public/OfferDetail';
import BookingConfirmation from './pages/public/BookingConfirmation';
import UserLogin from './pages/public/UserLogin';
import UserSignup from './pages/public/UserSignup';
import ForgotPassword from './pages/public/ForgotPassword';
import UserProfile from './pages/public/UserProfile';
import { auth } from './firebase';
import { 
  Moon, Sun, Shield, LayoutDashboard, Tag, 
  CalendarCheck, User, LogOut, Compass, LogIn, UserPlus 
} from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        
        {/* Left Side Panel on Desktop */}
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Top Header on Mobile */}
        <MobileHeader darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main Content Area */}
        <main className="pt-20 md:pt-8 pb-24 md:pb-8 px-4 md:pl-72 md:pr-8 container mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<CustomerPrivateRoute><OfferList /></CustomerPrivateRoute>} />
            <Route path="/offer/:id" element={<CustomerPrivateRoute><OfferDetail /></CustomerPrivateRoute>} />
            <Route path="/booking/:id" element={<CustomerPrivateRoute><BookingConfirmation /></CustomerPrivateRoute>} />
            
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<CustomerPrivateRoute><UserProfile /></CustomerPrivateRoute>} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/offers" element={<PrivateRoute><AdminOffers /></PrivateRoute>} />
            <Route path="/admin/bookings" element={<PrivateRoute><AdminBookings /></PrivateRoute>} />
            <Route path="/admin/profile" element={<PrivateRoute><AdminProfile /></PrivateRoute>} />
          </Routes>
        </main>

        {/* Floating Bottom Navigation Panel on Mobile */}
        <MobileNavbar />

      </div>
    </Router>
  );
}

// Left Side Sidebar Panel Component
const Sidebar = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (val: boolean) => void }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;

  // Navigation Links configuration
  const getNavLinks = () => {
    if (!token) {
      return [
        { to: '/', label: 'Browse Deals', icon: <Compass size={18} /> },
        { to: '/login', label: 'Sign In', icon: <LogIn size={18} /> },
        { to: '/signup', label: 'Sign Up', icon: <UserPlus size={18} /> },
        { to: '/admin/login', label: 'Admin Console', icon: <Shield size={18} /> },
      ];
    }

    if (user && user.role === 'Admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/admin/offers', label: 'Offers Manager', icon: <Tag size={18} /> },
        { to: '/admin/bookings', label: 'Bookings Manager', icon: <CalendarCheck size={18} /> },
        { to: '/admin/profile', label: 'Business Profile', icon: <User size={18} /> },
        { to: '/', label: 'View Deals Portal', icon: <Compass size={18} /> },
      ];
    }

    // Logged in standard Customer
    return [
      { to: '/', label: 'Browse Deals', icon: <Compass size={18} /> },
      { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
    ];
  };

  const links = getNavLinks();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 z-50 p-6 justify-between select-none">
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link to="/" className="block text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 hover:opacity-90 transition">
          SmartOffer
        </Link>

        {/* User profile details */}
        <div className="p-4 bg-slate-100/50 dark:bg-slate-950/60 border border-slate-200/30 dark:border-slate-800/40 rounded-2xl">
          {token && user ? (
            <div className="space-y-2">
              <div className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest">Logged In As</div>
              <div className="truncate font-extrabold text-sm text-slate-800 dark:text-white" title={user.name || user.email}>
                {user.name || user.email.split('@')[0]}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  user.role === 'Admin' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                }`}>
                  {user.role === 'Admin' ? <Shield size={10} /> : null}
                  {user.role}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest">Welcome Guest</div>
              <div className="text-[11px] font-semibold text-slate-500">Sign in to book offers</div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5">
          <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-2">Navigation</div>
          {links.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all relative ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {active && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute right-2 w-1 h-5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom control panel */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition"
        >
          {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {token && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

// Top Header on Mobile Screen
const MobileHeader = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (val: boolean) => void }) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 z-40 transition-colors duration-300">
      <div className="flex items-center justify-between h-full px-6">
        <Link to="/" className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 hover:opacity-90 transition">
          SmartOffer
        </Link>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

// Bottom Navigation Bar on Mobile Screen
const MobileNavbar = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;

  const getTabs = () => {
    if (!token) {
      return [
        { to: '/', label: 'Deals', icon: <Compass size={18} /> },
        { to: '/login', label: 'Login', icon: <LogIn size={18} /> },
        { to: '/signup', label: 'Signup', icon: <UserPlus size={18} /> },
      ];
    }

    if (user && user.role === 'Admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/admin/offers', label: 'Offers', icon: <Tag size={18} /> },
        { to: '/admin/bookings', label: 'Bookings', icon: <CalendarCheck size={18} /> },
        { to: '/admin/profile', label: 'Profile', icon: <User size={18} /> },
        { to: '/', label: 'Portal', icon: <Compass size={18} /> },
      ];
    }

    // Customer / User
    return [
      { to: '/', label: 'Deals', icon: <Compass size={18} /> },
      { to: '/profile', label: 'Profile', icon: <User size={18} /> },
      { to: '#logout', label: 'Logout', icon: <LogOut size={18} />, onClick: handleLogout },
    ];
  };

  const tabs = getTabs();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-50/90 via-slate-50/40 to-transparent dark:from-slate-950/90 dark:via-slate-950/40 pointer-events-none">
      <nav className="flex justify-around items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-2 shadow-2xl pointer-events-auto max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = tab.to !== '#logout' && isActive(tab.to);
          
          if (tab.onClick) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-red-500 hover:scale-105 transition-transform"
              >
                {tab.icon}
                <span className="text-[9px] font-bold">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link 
              key={tab.to} 
              to={tab.to} 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative ${
                active 
                  ? 'text-indigo-600 dark:text-indigo-400 scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-bold">{tab.label}</span>
              {active && (
                <motion.span 
                  layoutId="mobile-nav-glow" 
                  className="absolute inset-0 bg-indigo-50/30 dark:bg-indigo-900/20 -z-10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = token && user && user.role === 'Admin';
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

const CustomerPrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default App;
