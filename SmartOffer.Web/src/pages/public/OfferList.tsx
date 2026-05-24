import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Timer, MapPin, Search, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfferList() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [businessType, setBusinessType] = useState('All');
  const [category, setCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // Mobile drawer trigger
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await apiClient.get('/offers');
      setOffers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setBusinessType('All');
    setCategory('All');
    setFilterDate('');
    setMaxPrice(5000);
    setAvailableOnly(false);
  };

  // Filter filtering
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.business?.name && offer.business.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (offer.description && offer.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBusinessType = 
      businessType === 'All' || 
      (offer.business?.businessType && offer.business.businessType === businessType);

    const matchesCategory = 
      category === 'All' || 
      offer.category === category;

    let matchesDate = true;
    if (filterDate) {
      const filterTime = new Date(filterDate).setHours(0,0,0,0);
      const startTime = new Date(offer.startDate).setHours(0,0,0,0);
      const endTime = new Date(offer.endDate).setHours(0,0,0,0);
      const hasSlotOnDate = offer.slots?.some((slot: any) => 
        new Date(slot.slotDate).setHours(0,0,0,0) === filterTime
      );
      matchesDate = (filterTime >= startTime && filterTime <= endTime) || hasSlotOnDate;
    }

    const matchesPrice = offer.offerPrice <= maxPrice;

    const totalAvailableSeats = offer.slots?.reduce((sum: number, slot: any) => {
      if (slot.status === 'Available') {
        return sum + (slot.capacity - slot.bookedCount);
      }
      return sum;
    }, 0) || 0;
    const matchesAvailability = !availableOnly || totalAvailableSeats > 0;

    return matchesSearch && matchesBusinessType && matchesCategory && matchesDate && matchesPrice && matchesAvailability;
  });

  // Framer Motion variants for lists
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };

  // Filter content component (reusable for desktop & mobile drawer)
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search slots, venues..." 
            className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      {/* Business Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Category</label>
        <select 
          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition"
          value={businessType}
          onChange={e => setBusinessType(e.target.value)}
        >
          <option value="All">All Business Types</option>
          <option value="Gym">Gym</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Salon">Salon</option>
          <option value="Clinic">Clinic</option>
          <option value="Coaching">Coaching</option>
          <option value="Turf">Turf</option>
          <option value="Spa">Spa</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Offer Type</label>
        <select 
          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="All">All Offers</option>
          <option value="Gym">Gym</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Salon">Salon</option>
          <option value="Clinic">Clinic</option>
          <option value="Coaching">Coaching</option>
          <option value="Turf">Turf</option>
          <option value="Spa">Spa</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Date</label>
        <input 
          type="date" 
          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Max Pricing</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">₹{maxPrice}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="5000" 
          step="50"
          className="w-full accent-indigo-600"
          value={maxPrice}
          onChange={e => setMaxPrice(parseInt(e.target.value))}
        />
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center gap-3 pt-2">
        <input 
          type="checkbox" 
          id="availableOnlyCheckbox"
          className="w-5 h-5 rounded-xl border-slate-300 dark:border-slate-800 accent-indigo-600 focus:ring-indigo-500 text-indigo-600 cursor-pointer"
          checked={availableOnly}
          onChange={e => setAvailableOnly(e.target.checked)}
        />
        <label htmlFor="availableOnlyCheckbox" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
          Show Available Slots Only
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl pb-16">
      
      {/* Header Banner */}
      <div className="text-center py-12 md:py-20 max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
        >
          Book Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Exclusive Deal</span>
        </motion.h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Premium limited-time slot bookings and flash offers for salons, turfs, gym sessions, and restaurants near you. Act fast before they sell out!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Desktop Filters Panel (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 p-4 xl:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-sm xl:text-base flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">Filter Deals</span>
            </h3>
            <button 
              onClick={resetFilters}
              className="text-[10px] xl:text-xs font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0"
            >
              Clear All
            </button>
          </div>
          <FilterControls />
        </div>

        {/* Offers Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <p className="text-slate-500 font-bold text-lg">No active slot offers match your criteria.</p>
              <p className="text-slate-400 text-sm">Try broadening your searches or resetting the filters.</p>
              <button onClick={resetFilters} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700 transition">
                Reset Filters
              </button>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants as any}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredOffers.map(offer => {
                const totalSlotsCount = offer.slots?.length || 0;
                const totalAvailableSeats = offer.slots?.reduce((sum: number, slot: any) => {
                  if (slot.status === 'Available') {
                    return sum + (slot.capacity - slot.bookedCount);
                  }
                  return sum;
                }, 0) || 0;

                return (
                  <motion.div key={offer.id} variants={cardVariants as any} className="h-full">
                    <OfferCard 
                      offer={offer} 
                      availableSeats={totalAvailableSeats} 
                      slotsCount={totalSlotsCount} 
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

      </div>

      {/* Floating Filter Button for Mobile Devices */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <button 
          onClick={() => setShowMobileDrawer(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all pointer-events-auto text-sm border border-slate-800 dark:border-slate-200/50"
        >
          <SlidersHorizontal size={16} /> Filters
          {filteredOffers.length !== offers.length && (
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
              *
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {showMobileDrawer && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileDrawer(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Bottom Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] border-t border-slate-200 dark:border-slate-800 p-6 z-50 max-h-[85vh] overflow-y-auto lg:hidden shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-xl flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-indigo-600" /> Filter Slots
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={resetFilters} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition">
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowMobileDrawer(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <FilterControls />
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-lg"
              >
                Apply Filters ({filteredOffers.length} Deals)
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// Custom Premium Offer Card Component
function OfferCard({ offer, availableSeats, slotsCount }: { offer: any; availableSeats: number; slotsCount: number }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(offer.endDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [offer.endDate]);

  const hasBanner = !!(offer.bannerImageUrl && offer.bannerImageUrl.trim() !== '');

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-550 flex flex-col h-full justify-between">
      <div
        className="relative h-44 p-6 flex flex-col justify-end text-white overflow-hidden"
        style={hasBanner ? { background: 'linear-gradient(to br, #4f46e5, #7c3aed)' } : {}}
      >
        {/* Banner image */}
        {hasBanner && (
          <>
            <img
              src={offer.bannerImageUrl}
              alt={offer.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
          </>
        )}

        {/* Fallback pattern for no banner */}
        {!hasBanner && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          </>
        )}
        
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-md">
          {Math.round(offer.discountPercentage)}% OFF
        </div>
        
        <div className="absolute top-4 left-4 bg-slate-950/45 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider">
          <Timer size={11} strokeWidth={2.5} /> {timeLeft}
        </div>
        
        <span className="relative w-fit text-[9px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md mb-2">
          {offer.category}
        </span>
        
        <h3 className="relative text-2xl font-black leading-tight truncate drop-shadow-sm">{offer.title}</h3>
        
        <p className="relative text-white/80 font-bold flex items-center gap-1 mt-1 text-xs">
          <MapPin size={12} /> {offer.business?.name || 'Local Business'}
        </p>
      </div>
      
      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] text-slate-400 line-through font-bold">₹{offer.originalPrice}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">₹{offer.offerPrice}</p>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider ${
              availableSeats > 0 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {availableSeats > 0 ? `${availableSeats} slots free` : 'Sold Out'}
            </span>
            <p className="text-[9px] text-slate-400 font-extrabold mt-2 uppercase tracking-widest">{slotsCount} active slots</p>
          </div>
        </div>

        <Link 
          to={`/offer/${offer.id}`} 
          className="group/btn flex items-center justify-center gap-2 w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-indigo-500/25 text-sm"
        >
          Book Slot <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
