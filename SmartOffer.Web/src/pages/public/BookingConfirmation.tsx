import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Calendar, Clock, MapPin, Tag, User, Users, ArrowRight, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/bookings/${id}`).then(res => setBooking(res.data));
  }, [id]);

  if (!booking) return <div className="text-center p-12 animate-pulse">Generating your ticket confirmation...</div>;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=4f46e5&data=${booking.bookingReference}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-4 flex flex-col justify-center items-center min-h-[85vh] py-8 space-y-6"
    >
      
      {/* Animated Checkmark Icon */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center border-2 border-emerald-500/30">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your slot deals are locked. Enjoy your session!</p>
      </div>

      {/* Skeuomorphic Ticket Pass */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Top Ticket Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:12px_12px]" />
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
              Flash Deal Ticket
            </span>
            <p className="text-2xl font-black tracking-tight">{booking.offer?.title || 'Special Promotion'}</p>
          </div>
          <div className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur">
            <Tag size={20} />
          </div>
        </div>

        {/* Ticket Details Panel */}
        <div className="p-6 md:p-8 space-y-6 relative">
          
          {/* Main Booking Code */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Reference</p>
              <p className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">{booking.bookingReference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</p>
              <span className="inline-block px-3 py-1 text-xs font-black rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Dotted Cutout Separation Line */}
          <div className="relative h-px border-t border-dashed border-slate-200 dark:border-slate-800 my-2">
            <div className="absolute -left-10 -top-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800" />
            <div className="absolute -right-10 -top-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800" />
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={11} /> Venue Partner</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1">{booking.offer?.business?.name || 'Local Business'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{booking.offer?.business?.address || 'Main street venue'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={11} /> Selected Date</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1">
                  {booking.slot ? new Date(booking.slot.slotDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={11} /> Confirmed Slot</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1">
                  {booking.slot ? `${booking.slot.startTime.slice(0, 5)} - ${booking.slot.endTime.slice(0, 5)}` : 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={11} /> Guest</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1 truncate">{booking.customerName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Users size={11} /> Seats</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1">{booking.peopleCount} Pax</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 mt-4 space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <img src={qrCodeUrl} alt="Booking Entry QR" className="w-36 h-36" />
            </div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">SCAN AT DESK FOR CHECK-IN</p>
          </div>

        </div>

      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center w-full max-w-xl">
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 shadow transition-all w-full sm:w-auto"
        >
          <Printer size={16} /> Print Pass
        </button>
        <Link 
          to="/" 
          className="flex items-center justify-center gap-1 px-8 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white shadow-lg transition-all w-full sm:w-auto text-sm"
        >
          Discover More Deals <ArrowRight size={16} />
        </Link>
      </div>

    </motion.div>
  );
}
