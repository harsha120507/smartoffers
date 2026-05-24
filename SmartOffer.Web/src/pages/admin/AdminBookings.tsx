import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Calendar, Phone, Mail, FileSpreadsheet, Check, X, RefreshCw, Eye, QrCode, Camera } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanRef, setScanRef] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult(null);

    const match = bookings.find(b => b.bookingReference.toLowerCase().trim() === scanRef.toLowerCase().trim());
    if (!match) {
      setScanResult({ success: false, message: 'Invalid booking reference. No record found.' });
      return;
    }

    try {
      await apiClient.put(`/bookings/${match.id}/status`, { status: 'Completed' });
      setBookings(bookings.map(b => b.id === match.id ? { ...b, status: 'Completed' } : b));
      if (selectedBooking && selectedBooking.id === match.id) {
        setSelectedBooking({ ...selectedBooking, status: 'Completed' });
      }
      setScanResult({ success: true, message: `Checked in successfully: ${match.customerName} (${match.bookingReference})` });
      setScanRef('');
    } catch (err) {
      setScanResult({ success: false, message: 'Check-in failed. Please try again.' });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await apiClient.put(`/bookings/${id}/status`, { status: newStatus });
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data || 'Failed to update booking status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Reference', 'Customer Name', 'Phone', 'Email', 'Offer', 'Slot Date', 'Slot Time', 'People Count', 'Special Note', 'Status', 'Booked At'];
    const rows = bookings.map(b => [
      b.bookingReference,
      b.customerName,
      b.customerPhone,
      b.customerEmail || '',
      b.offer?.title || '',
      b.slot ? new Date(b.slot.slotDate).toLocaleDateString() : '',
      b.slot ? `${b.slot.startTime} - ${b.slot.endTime}` : '',
      b.peopleCount,
      b.specialNote || '',
      b.status,
      new Date(b.createdAt).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      (b.offer?.title && b.offer.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold">Manage Bookings</h2>
          <p className="text-slate-500 dark:text-slate-400">View and update customer slot bookings</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchBookings} 
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-2 px-4 py-3 font-bold rounded-xl transition-all text-sm w-full md:w-auto justify-center cursor-pointer ${
              showScanner 
                ? 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode size={18} /> {showScanner ? 'Close Scanner' : 'Scan Check-in QR'}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all text-sm w-full md:w-auto justify-center cursor-pointer"
          >
            <FileSpreadsheet size={18} /> Export CSV
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-8 items-center animate-in slide-in-from-top duration-300">
          <style>{`
            @keyframes scan {
              0%, 100% { top: 16px; }
              50% { top: calc(100% - 20px); }
            }
          `}</style>
          {/* Viewfinder simulation */}
          <div className="relative w-48 h-48 bg-slate-950 rounded-2xl border-2 border-indigo-500 overflow-hidden flex items-center justify-center shrink-0 select-none">
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br" />
            
            <div className="absolute left-4 right-4 h-0.5 bg-indigo-500/80 shadow-md shadow-indigo-500/50 animate-[scan_2s_ease-in-out_infinite]" />

            <div className="text-center p-4 space-y-2 relative z-10">
              <Camera className="mx-auto text-slate-655 animate-pulse" size={28} />
              <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Viewfinder Active</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-4 w-full text-left">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <QrCode className="text-indigo-400" size={20} /> Simulated QR Check-in Desk
              </h3>
              <p className="text-xs text-slate-400 mt-1">Paste a reference code or select an active user slot to simulate scanning a ticket pass.</p>
            </div>

            {scanResult && (
              <div className={`p-4 text-xs font-bold rounded-2xl border flex items-center gap-2 ${
                scanResult.success 
                  ? 'bg-green-950/20 text-green-400 border-green-900/30' 
                  : 'bg-red-950/20 text-red-400 border-red-900/30'
              }`}>
                {scanResult.success ? <Check size={16} /> : <X size={16} />}
                <span>{scanResult.message}</span>
              </div>
            )}

            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Paste code (e.g. BK-xxxx)"
                className="flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-white"
                value={scanRef}
                onChange={e => setScanRef(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Scan Ticket
              </button>
            </form>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-[9px] font-extrabold text-slate-550 uppercase tracking-widest">Quick Scan Simulator (Demo)</label>
              <div className="flex flex-wrap gap-1.5">
                {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').slice(0, 3).map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setScanRef(b.bookingReference);
                      setScanResult(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-extrabold rounded-lg text-slate-350 transition cursor-pointer"
                  >
                    🎫 {b.customerName} ({b.bookingReference.substring(0, 10)}...)
                  </button>
                ))}
                {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length === 0 && (
                  <span className="text-xs text-slate-500 italic">No confirmed/pending bookings available to scan.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by customer, offer, reference or phone..."
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
              <option value="No Show">No Show</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">Reference</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">Offer / Slot</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">People</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 animate-pulse">Loading bookings...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">No bookings match the search criteria.</td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-400">{b.bookingReference}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{b.customerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={10} /> {b.customerPhone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{b.offer?.title || 'Unknown Offer'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> 
                          {b.slot ? `${new Date(b.slot.slotDate).toLocaleDateString()} at ${b.slot.startTime.slice(0, 5)} - ${b.slot.endTime.slice(0, 5)}` : 'N/A'}
                        </p>
                      </td>
                      <td className="p-4 font-semibold">{b.peopleCount}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          b.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          b.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          b.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          b.status === 'Waitlisted' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {b.status !== 'Confirmed' && b.status !== 'Completed' && (
                            <button
                              onClick={() => updateStatus(b.id, 'Confirmed')}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Confirm booking"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => updateStatus(b.id, 'Cancelled')}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Cancel booking"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
          <h3 className="font-extrabold text-lg mb-4">Booking Details</h3>
          {selectedBooking ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Booking Reference</p>
                <p className="font-mono text-sm font-bold mt-0.5 text-indigo-600 dark:text-indigo-400">{selectedBooking.bookingReference}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500">Customer Name</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Contact Details</p>
                <p className="text-sm font-medium flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-300">
                  <Phone size={14} /> {selectedBooking.customerPhone}
                </p>
                {selectedBooking.customerEmail && (
                  <p className="text-sm font-medium flex items-center gap-1.5 mt-1 text-slate-700 dark:text-slate-300">
                    <Mail size={14} /> {selectedBooking.customerEmail}
                  </p>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500">Offer Title</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.offer?.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reserved Slot</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBooking.slot ? `${new Date(selectedBooking.slot.slotDate).toLocaleDateString()} at ${selectedBooking.slot.startTime.slice(0, 5)} - ${selectedBooking.slot.endTime.slice(0, 5)}` : 'N/A'}
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-300 mt-1">
                  People Count: {selectedBooking.peopleCount}
                </p>
              </div>
              {selectedBooking.specialNote && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Special Note</p>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{selectedBooking.specialNote}"
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs text-slate-500">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateStatus(selectedBooking.id, 'Confirmed')} className="py-2 px-3 text-xs font-bold text-center bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 hover:bg-green-100 rounded-xl transition border border-green-100 dark:border-green-900/30">
                    Confirm
                  </button>
                  <button onClick={() => updateStatus(selectedBooking.id, 'Cancelled')} className="py-2 px-3 text-xs font-bold text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 rounded-xl transition border border-red-100 dark:border-red-900/30">
                    Cancel
                  </button>
                  <button onClick={() => updateStatus(selectedBooking.id, 'Completed')} className="py-2 px-3 text-xs font-bold text-center bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 hover:bg-blue-100 rounded-xl transition border border-blue-100 dark:border-blue-900/30">
                    Complete
                  </button>
                  <button onClick={() => updateStatus(selectedBooking.id, 'No Show')} className="py-2 px-3 text-xs font-bold text-center bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition border border-slate-100 dark:border-slate-800">
                    No Show
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Select a booking to view its details and update status
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
