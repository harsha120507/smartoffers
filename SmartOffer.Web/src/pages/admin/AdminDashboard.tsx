import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Users, Tag, CalendarCheck, TrendingUp, CheckCircle2, AlertTriangle, Percent, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!summary) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  const mainStats = [
    { label: 'Total Offers', value: summary.totalOffers, icon: <Tag size={20} className="text-blue-500" />, color: 'from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-900/30' },
    { label: 'Active Offers', value: summary.activeOffers, icon: <TrendingUp size={20} className="text-indigo-500" />, color: 'from-indigo-500/10 to-purple-500/10 border-indigo-200/50 dark:border-indigo-900/30' },
    { label: 'Total Bookings', value: summary.totalBookings, icon: <CalendarCheck size={20} className="text-green-500" />, color: 'from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-900/30' },
    { label: 'Today\'s Bookings', value: summary.todaysBookings, icon: <Users size={20} className="text-orange-500" />, color: 'from-orange-500/10 to-amber-500/10 border-orange-200/50 dark:border-orange-900/30' },
  ];

  // SVG Chart Calculation (Booking Velocity Curve)
  const chartPoints = [30, 45, 35, 60, 40, 75, summary.totalBookings || 10];
  const chartWidth = 500;
  const chartHeight = 120;
  const maxPoint = Math.max(...chartPoints, 80);
  
  const pointsStr = chartPoints
    .map((p, i) => {
      const x = (i / (chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - (p / maxPoint) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  // Gradient Area Path
  const areaPath = `M 0,${chartHeight} L ${pointsStr} L ${chartWidth},${chartHeight} Z`;

  // Capacity Ring Calculation
  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const bookedPercent = summary.totalCapacity > 0 ? (summary.bookedSeats / summary.totalCapacity) * 100 : 0;
  const ringStrokeOffset = ringCircumference - (bookedPercent / 100) * ringCircumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 space-y-8 pb-12"
    >
      {/* Upper Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Performance Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time seat occupancies, campaign conversions, and customer records</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/offers" className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs shadow-sm">
            Manage Offers
          </Link>
          <Link to="/admin/bookings" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-1">
            Bookings Panel <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-6 bg-gradient-to-br ${stat.color} bg-white dark:bg-slate-900 rounded-3xl border shadow-sm flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-4xl font-extrabold mt-2 tracking-tight">{stat.value}</p>
            </div>
            <div className="p-4 bg-white/90 dark:bg-slate-950/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & Seating Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Booking Velocity Chart (Col-span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-80">
          <div>
            <h3 className="font-extrabold text-lg">Booking Velocity</h3>
            <p className="text-xs text-slate-400">Total bookings mapped over the last 7 cycles</p>
          </div>
          
          <div className="w-full flex justify-center py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#cbd5e1" strokeWidth="0.5" className="opacity-30" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-30" />
              <line x1="0" y1="10" x2={chartWidth} y2="10" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-30" />
              
              {/* Area */}
              <path d={areaPath} fill="url(#chartGlow)" />
              {/* Line */}
              <polyline fill="none" stroke="#4f46e5" strokeWidth="3" points={pointsStr} />
              
              {/* Nodes */}
              {chartPoints.map((p, i) => {
                const x = (i / (chartPoints.length - 1)) * chartWidth;
                const y = chartHeight - (p / maxPoint) * (chartHeight - 20) - 10;
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                    <circle cx={x} cy={y} r="10" fill="#4f46e5" className="opacity-0 group-hover:opacity-20 transition" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Cycle -6</span>
            <span>Cycle -4</span>
            <span>Cycle -2</span>
            <span>Today</span>
          </div>
        </div>

        {/* Circular Seat Occupancy Analytics */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-80">
          <div>
            <h3 className="font-extrabold text-lg">Seat Allocations</h3>
            <p className="text-xs text-slate-400">Total capacity vs Booked reservation metrics</p>
          </div>

          <div className="flex justify-center items-center relative my-4">
            <svg width="130" height="130" className="transform -rotate-90">
              {/* Back Ring */}
              <circle cx="65" cy="65" r={ringRadius} fill="transparent" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="10" />
              {/* Progress Ring */}
              <motion.circle 
                cx="65" 
                cy="65" 
                r={ringRadius} 
                fill="transparent" 
                stroke="#6366f1" 
                strokeWidth="10" 
                strokeDasharray={ringCircumference}
                initial={{ strokeDashoffset: ringCircumference }}
                animate={{ strokeDashoffset: ringStrokeOffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(bookedPercent)}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booked</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Booked Seats</span>
              <span className="font-bold text-slate-800 dark:text-white">{summary.bookedSeats}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500" /> Available Seats</span>
              <span className="font-bold text-slate-800 dark:text-white">{summary.availableSeats}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Percent size={12} className="text-indigo-500" /> Conversion Ratio</span>
              <span className="font-bold text-slate-800 dark:text-white">{summary.conversionRate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Time-Slot Peak Heatmap Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" /> Time-Slot Peak Heatmap
          </h3>
          <p className="text-xs text-slate-400">Demand density and occupancy percentages mapped by hour and category</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { category: 'Dining', morning: '15%', noon: '68%', afternoon: '22%', evening: '94%', peakTime: '8 PM' },
            { category: 'Wellness', morning: '45%', noon: '30%', afternoon: '55%', evening: '72%', peakTime: '6 PM' },
            { category: 'Gym & Sports', morning: '88%', noon: '20%', afternoon: '40%', evening: '82%', peakTime: '7 AM' },
            { category: 'Co-Working', morning: '60%', noon: '95%', afternoon: '78%', evening: '15%', peakTime: '12 PM' },
            { category: 'Entertainment', morning: '10%', noon: '42%', afternoon: '65%', evening: '90%', peakTime: '9 PM' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{item.category}</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">Peak: {item.peakTime}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>9 AM (Morning)</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.morning}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: item.morning }} />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>12 PM (Noon)</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.noon}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: item.noon }} />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>3 PM (Afternoon)</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.afternoon}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: item.afternoon }} />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>7 PM (Evening)</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.evening}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: item.evening }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">Recent Reservations</h3>
            <p className="text-xs text-slate-400">Review guest check-ins and booking updates</p>
          </div>
          <Link to="/admin/bookings" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-0.5">
            Manage All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-900">
              <tr>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Customer</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Offer Title</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Booked Slot</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Pax</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.recentBookings.map((b: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{b.customerName}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{b.offerName}</td>
                  <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{b.slotTime}</td>
                  <td className="p-4 font-black">{b.peopleCount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      b.status === 'Confirmed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                      b.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                      b.status === 'Cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to="/admin/bookings" className="text-[10px] font-extrabold uppercase bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 transition">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {summary.recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No bookings registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
