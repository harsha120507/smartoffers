import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { MapPin, Info, Users, Clock, Calendar, Check, AlertCircle, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VenueMapSimulator = ({ businessName }: { businessName: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-black text-base text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MapPin className="text-indigo-600" size={18} /> Venue Map Location
          </h4>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Real-time local venue mapping</p>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-900/30">
          1.4 km away
        </span>
      </div>

      <div className="h-48 bg-slate-50 dark:bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-inner flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute top-1/2 left-0 right-0 h-10 bg-slate-100 dark:bg-slate-900 -translate-y-1/2 border-y border-slate-200/50 dark:border-slate-800/40" />
        <div className="absolute left-1/3 top-0 bottom-0 w-10 bg-slate-100 dark:bg-slate-900 border-x border-slate-200/50 dark:border-slate-800/40" />
        <div className="absolute right-1/4 top-0 bottom-0 w-10 bg-slate-100 dark:bg-slate-900 border-x border-slate-200/50 dark:border-slate-800/40" />

        <div className="absolute left-[15%] top-1/4 flex flex-col items-center">
          <div className="w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-md" />
          <span className="text-[9px] font-extrabold text-blue-600 bg-white/95 dark:bg-slate-900 px-1.5 py-0.5 rounded shadow border mt-1 select-none">You</span>
        </div>

        <div className="absolute right-[20%] bottom-1/4 flex flex-col items-center">
          <div className="w-4.5 h-4.5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white">
            <MapPin size={10} />
          </div>
          <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-400 bg-white/95 dark:bg-slate-900 px-1.5 py-0.5 rounded shadow border mt-1 truncate max-w-[95px] select-none">
            {businessName}
          </span>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 65,45 L 145,45 L 145,120 L 310,120" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5 5" className="animate-[dash_10s_linear_infinite]" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-500">
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/20">
          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Estimated Driving Time</span>
          <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block">🚗 4 mins (via Main St)</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/20">
          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Estimated Walking Time</span>
          <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block">🚶 18 mins</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  
  // Pre-populate guest name and email from localStorage user details if logged in
  const [form, setForm] = useState(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      name: user?.name || '',
      phone: '',
      email: user?.email || '',
      specialNote: '',
      peopleCount: 1
    };
  });
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activePeriod, setActivePeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [toastAlert, setToastAlert] = useState<{ show: boolean; message: string; title: string } | null>(null);

  // Image carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState<1 | -1>(1);

  const getSlotPeriod = (timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const slotsByPeriod = offer ? {
    morning: offer.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'morning') || [],
    afternoon: offer.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'afternoon') || [],
    evening: offer.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'evening') || []
  } : { morning: [], afternoon: [], evening: [] };

  useEffect(() => {
    fetchOfferDetails();
  }, [id]);

  const fetchOfferDetails = async () => {
    try {
      const res = await apiClient.get(`/offers/${id}`);
      setOffer(res.data);
      
      const mSlots = res.data.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'morning') || [];
      const aSlots = res.data.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'afternoon') || [];
      const eSlots = res.data.slots?.filter((s: any) => (s.status === 'Available' || s.status === 'Full') && getSlotPeriod(s.startTime) === 'evening') || [];

      if (mSlots.length > 0) setActivePeriod('morning');
      else if (aSlots.length > 0) setActivePeriod('afternoon');
      else if (eSlots.length > 0) setActivePeriod('evening');

      const firstAvailableSlot = res.data.slots?.find((s: any) => s.status === 'Available' || s.status === 'Full');
      if (firstAvailableSlot) {
        setSelectedSlotId(firstAvailableSlot.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedSlotId) {
      setErrorMsg('Please select a valid time slot.');
      return;
    }

    setBooking(true);
    try {
      const payload = {
        offerId: offer.id,
        slotId: selectedSlotId,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || null,
        peopleCount: parseInt(form.peopleCount.toString()),
        specialNote: form.specialNote || null
      };

      const res = await apiClient.post('/bookings', payload);
      
      const isWaitlist = res.data.status === 'Waitlisted';
      setToastAlert({
        show: true,
        title: isWaitlist ? 'Waitlist Confirmation' : 'SMS Sent Successfully',
        message: isWaitlist
          ? `To: ${form.phone}\n"Hi ${form.name}, you have joined the waitlist for ${offer.title}. Ref: ${res.data.bookingReference}. We will notify you if a slot opens!"`
          : `To: ${form.phone}\n"Hi ${form.name}, your slot for ${offer.title} is CONFIRMED! Ref: ${res.data.bookingReference}. See you there!"`
      });

      setTimeout(() => {
        navigate(`/booking/${res.data.id}`);
      }, 3500);
    } catch (err: any) {
      const errorText = err.response?.data?.message || err.response?.data || 'Booking failed. Make sure the slot has capacity and you haven\'t exceeded the customer limit.';
      setErrorMsg(errorText);
      setBooking(false);
    }
  };

  if (!offer) return <div className="text-center p-12 animate-pulse">Loading slot details...</div>;

  const selectedSlot = offer.slots?.find((s: any) => s.id === selectedSlotId);
  const isSelectedSlotFull = selectedSlot ? (selectedSlot.capacity - selectedSlot.bookedCount <= 0) : false;
  const maxCapacity = selectedSlot 
    ? (isSelectedSlotFull ? offer.maxBookingPerCustomer : (selectedSlot.capacity - selectedSlot.bookedCount)) 
    : offer.maxBookingPerCustomer;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 max-w-5xl pb-16 space-y-6"
    >
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft size={16} /> Back to Deals
      </Link>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <p className="font-semibold text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          {/* === Image Carousel / Header Banner === */}
          {(() => {
            const rawUrls: string = offer.imageUrls || '';
            const images: string[] = rawUrls
              .split(',')
              .map((u: string) => u.trim())
              .filter((u: string) => u.length > 0);

            const hasImages = images.length > 0;

            const goNext = () => {
              setCarouselDirection(1);
              setCarouselIndex((prev) => (prev + 1) % images.length);
            };
            const goPrev = () => {
              setCarouselDirection(-1);
              setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
            };

            if (hasImages) {
              return (
                <div className="relative h-60 md:h-80 rounded-3xl overflow-hidden shadow-xl bg-slate-900 group">
                  <AnimatePresence initial={false} custom={carouselDirection}>
                    <motion.img
                      key={carouselIndex}
                      src={images[carouselIndex]}
                      alt={`${offer.title} photo ${carouselIndex + 1}`}
                      custom={carouselDirection}
                      variants={{
                        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'; }}
                    />
                  </AnimatePresence>

                  {/* Gradient overlays for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Offer info bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <span className="bg-white/20 backdrop-blur w-max px-3 py-1 rounded-lg text-[10px] font-black tracking-widest mb-3 uppercase inline-block">
                      {offer.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-md leading-tight">{offer.title}</h1>
                    <p className="text-base text-white/90 flex items-center gap-1.5 font-bold">
                      <MapPin size={16} /> {offer.business?.name || 'Local Venue'}
                    </p>
                  </div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={22} />
                      </button>

                      {/* Slide counter */}
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10">
                        {carouselIndex + 1} / {images.length}
                      </div>

                      {/* Dot indicators */}
                      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
                        {images.map((_: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { setCarouselDirection(idx > carouselIndex ? 1 : -1); setCarouselIndex(idx); }}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                              idx === carouselIndex
                                ? 'bg-white scale-125'
                                : 'bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // Fallback: no images → original gradient banner
            return (
              <div className="h-60 md:h-80 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-800 p-8 flex flex-col justify-end text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                <span className="bg-white/20 backdrop-blur w-max px-3 py-1 rounded-lg text-[10px] font-black tracking-widest mb-3 uppercase">
                  {offer.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-md leading-tight">{offer.title}</h1>
                <p className="text-base text-white/90 flex items-center gap-1.5 font-bold">
                  <MapPin size={16} /> {offer.business?.name || 'Local Venue'}
                </p>
              </div>
            );
          })()}

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={20} /> Select Slot Date & Time
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pick from one of the active slots generated by the business</p>
              </div>
              
              <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/20 w-full sm:w-auto overflow-x-auto shrink-0 select-none">
                {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                  const count = slotsByPeriod[period].length;
                  const label = period === 'morning' ? 'Morning' : period === 'afternoon' ? 'Afternoon' : 'Evening';
                  const emoji = period === 'morning' ? '🌅' : period === 'afternoon' ? '☀️' : '🌙';
                  const active = activePeriod === period;
                  
                  return (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setActivePeriod(period)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        active 
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {slotsByPeriod[activePeriod].length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slotsByPeriod[activePeriod].map((slot: any) => {
                  const seatsLeft = Math.max(0, slot.capacity - slot.bookedCount);
                  const isSelected = selectedSlotId === slot.id;
                  const isFull = seatsLeft <= 0 || slot.status === 'Full';
                  const isUrgent = !isFull && seatsLeft <= 2;
                  const vacancyText = isFull 
                    ? 'Fully Booked • Join Waitlist' 
                    : seatsLeft === 1 
                      ? 'Only 1 left!' 
                      : isUrgent 
                        ? 'Filling fast!' 
                        : 'Seats available';

                  return (
                    <motion.button
                      key={slot.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-32 cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/50 shadow-md' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-1.5 shadow-md border-2 border-white dark:border-slate-900">
                          <Check size={10} strokeWidth={3.5} />
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(slot.slotDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center w-full mt-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isFull ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse' :
                          seatsLeft === 1 ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 animate-pulse' :
                          isUrgent ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        }`}>
                          {isFull ? vacancyText : `${seatsLeft} ${seatsLeft === 1 ? 'vacancy' : 'vacancies'} left • ${vacancyText}`}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-500 font-bold text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-sm">No active vacancies exist for this time period.</p>
                <p className="text-xs text-slate-400 font-normal">Try checking other periods or check back later!</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <Info className="text-indigo-500" size={20} /> About this slot
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold mt-2">
                {offer.description || "Grab this amazing limited-time offer before it's gone!"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Clock className="text-indigo-500 mb-2" size={20} />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Validity Ends</p>
                <p className="font-black text-sm text-slate-800 dark:text-slate-200 mt-1">{new Date(offer.endDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Users className="text-indigo-500 mb-2" size={20} />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Booking Limit</p>
                <p className="font-black text-sm text-slate-800 dark:text-slate-200 mt-1">{offer.maxBookingPerCustomer} person / booking</p>
              </div>
            </div>
          </div>

          <VenueMapSimulator businessName={offer.business?.name || 'Partner Venue'} />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 sticky top-24 space-y-6">
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-400 line-through font-bold">Value ₹{offer.originalPrice}</p>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">₹{offer.offerPrice}</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                  {Math.round(offer.discountPercentage)}% OFF
                </span>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Guest Name</label>
                <input required type="text" className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mobile Contact</label>
                <input required type="tel" className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. +91 99999 99999" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input type="email" className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. guest@email.com" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Guests count</label>
                <input required type="number" min="1" max={Math.min(offer.maxBookingPerCustomer, maxCapacity)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-extrabold text-sm" value={form.peopleCount} onChange={e => setForm({...form, peopleCount: parseInt(e.target.value)})} />
              </div>

              <button 
                type="submit" 
                disabled={booking || !selectedSlotId}
                className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-90 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                {booking 
                  ? (isSelectedSlotFull ? 'Joining Waitlist...' : 'Reserving slot...') 
                  : (isSelectedSlotFull ? 'Join Slot Waitlist' : 'Confirm Slot Reservation')}
              </button>
              {isSelectedSlotFull && (
                <p className="text-center text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2.5 bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-xl border border-amber-200/20">
                  ⚠️ All standard spots are occupied. You will join the waitlist and get auto-promoted if someone cancels.
                </p>
              )}
            </form>
            
            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold">
              <ShieldCheck size={14} className="text-green-500" /> Secure Instant Slot Confirmation
            </div>
          </div>
        </div>
      </div>

      {toastAlert && toastAlert.show && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 overflow-hidden flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-indigo-500 rounded-xl text-white">
            <ShieldCheck size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">{toastAlert.title}</h4>
            <p className="text-xs font-semibold mt-1 whitespace-pre-line text-slate-200 leading-normal">{toastAlert.message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
