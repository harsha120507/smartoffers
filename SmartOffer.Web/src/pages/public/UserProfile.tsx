import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { User, Mail, Calendar, Hash, Users, Clock, AlertCircle, Bookmark, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BookingHistoryItem {
  id: number;
  bookingReference: string;
  offerId: number;
  slotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  peopleCount: number;
  specialNote?: string;
  status: string;
  createdAt: string;
  offer?: {
    id: number;
    title: string;
    description: string;
    originalPrice: number;
    offerPrice: number;
  };
  slot?: {
    id: number;
    slotDate: string;
    startTime: string;
    endTime: string;
  };
}

export default function UserProfile() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchMyBookings = async () => {
    try {
      const res = await apiClient.get<BookingHistoryItem[]>('/bookings/my');
      setBookings(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Waitlisted entries might be promoted automatically.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await apiClient.put(`/bookings/${bookingId}/cancel`);
      await fetchMyBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
      case 'Waitlisted':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'; // Pending
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-650 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
          My Account
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Manage your profile and review reservations
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Profile Card (Left Column) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-200/50 dark:border-slate-800/50 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-200/50 dark:border-indigo-900/30">
              <User size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {user?.name || 'Guest User'}
              </h3>
              <span className="inline-flex px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-750 dark:bg-indigo-950/40 dark:text-indigo-300">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-450 border border-slate-100 dark:border-slate-800/40">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-450 border border-slate-100 dark:border-slate-800/40">
                <Hash size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Account ID</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  #{user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings Timeline (Right Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Reservation History
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-500 mt-4">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 rounded-[2rem] flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Could not retrieve history</h4>
                <p className="text-xs text-red-750 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 space-y-4"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-950 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200/30 dark:border-slate-800/40">
                <Bookmark size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No Reservations Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't booked any time-slot offers. Start browsing our local partner deals to secure a reservation!
                </p>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5">
                <Compass size={14} /> Explore Deals
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-md border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                          {booking.offer?.title || 'Time-Slot Offer'}
                        </h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>
                            {booking.slot?.slotDate ? new Date(booking.slot.slotDate).toLocaleDateString(undefined, { 
                              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                            }) : 'Date unavailable'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>
                            {booking.slot?.startTime ? booking.slot.startTime.substring(0, 5) : '00:00'} - {booking.slot?.endTime ? booking.slot.endTime.substring(0, 5) : '00:00'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span>{booking.peopleCount} {booking.peopleCount === 1 ? 'Person' : 'People'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-slate-400" />
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                            {booking.bookingReference}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Offer Price</div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        ₹{booking.offer?.offerPrice || 0}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 line-through">
                        Original: ₹{booking.offer?.originalPrice || 0}
                      </div>
                    </div>
                  </div>

                  {booking.specialNote && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 text-xs text-slate-450 italic bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-200/20">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 not-italic block mb-1">Special Note</span>
                      "{booking.specialNote}"
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {expandedBookingId === booking.id ? 'Hide Check-in Pass' : 'Show Check-in Pass (QR Code)'}
                      </button>
                      
                      {(booking.status === 'Confirmed' || booking.status === 'Pending' || booking.status === 'Waitlisted') && (
                        <button
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-750 hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                    <Link to={`/booking/${booking.id}`} className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline">
                      View Ticket Details →
                    </Link>
                  </div>

                  {expandedBookingId === booking.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-800/50 flex flex-col items-center justify-center space-y-2 overflow-hidden"
                    >
                      <div className="bg-white p-2.5 rounded-xl border border-slate-250 shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=4f46e5&data=${booking.bookingReference}`} 
                          alt="Check-in QR Pass" 
                          className="w-32 h-32" 
                        />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Scan this QR code at the desk for check-in</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
