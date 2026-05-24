import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Plus, Edit2, Trash2, Calendar, Clock, Users, PlusCircle } from 'lucide-react';

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    businessId: 1, // default business
    title: '',
    description: '',
    category: 'Gym',
    originalPrice: 0,
    offerPrice: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    totalCapacity: 10,
    maxBookingPerCustomer: 1,
    status: 'Active',
    termsAndConditions: '',
    imageUrls: '',
    bannerImageUrl: ''
  });

  const [imgList, setImgList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Slot Management States
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [selectedOfferForSlots, setSelectedOfferForSlots] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [slotFormData, setSlotFormData] = useState({
    slotDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    capacity: 10
  });

  useEffect(() => {
    fetchOffers();
    ensureBusinessExists();
  }, []);

  const ensureBusinessExists = async () => {
    try {
      const res = await apiClient.get('/business');
      if (res.data.length === 0) {
        await apiClient.post('/business', {
          name: "Demo Business",
          businessType: "Gym",
          ownerName: "Admin",
          phone: "1234567890",
          email: "admin@smartoffer.com",
          openingTime: "08:00:00",
          closingTime: "22:00:00"
        });
      } else {
        setFormData((prev: any) => ({ ...prev, businessId: res.data[0].id }));
      }
    } catch(e) {}
  };

  const fetchOffers = async () => {
    try {
      const res = await apiClient.get('/offers');
      setOffers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setImgList([]);
    setNewImageUrl('');
    setFormData({
      businessId: formData.businessId || 1,
      title: '',
      description: '',
      category: 'Gym',
      originalPrice: 0,
      offerPrice: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '17:00:00',
      totalCapacity: 10,
      maxBookingPerCustomer: 1,
      status: 'Active',
      termsAndConditions: '',
      imageUrls: '',
      bannerImageUrl: ''
    });
    setShowModal(true);
  };

  const openEditModal = (offer: any) => {
    setIsEditing(true);
    const urls = offer.imageUrls ? offer.imageUrls.split(',').filter((u: string) => u.trim() !== '') : [];
    setImgList(urls);
    setNewImageUrl('');
    setFormData({
      ...offer,
      startDate: new Date(offer.startDate).toISOString().split('T')[0],
      endDate: new Date(offer.endDate).toISOString().split('T')[0],
      startTime: offer.startTime.slice(0, 5),
      endTime: offer.endTime.slice(0, 5),
      imageUrls: offer.imageUrls || '',
      bannerImageUrl: offer.bannerImageUrl || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(formData.offerPrice) >= parseFloat(formData.originalPrice)) {
      alert('Offer price must be less than original price.');
      return;
    }

    try {
      const payload = {
        ...formData,
        startTime: formData.startTime.includes(':') && formData.startTime.split(':').length === 2 ? formData.startTime + ':00' : formData.startTime,
        endTime: formData.endTime.includes(':') && formData.endTime.split(':').length === 2 ? formData.endTime + ':00' : formData.endTime,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        imageUrls: imgList.join(','),
        bannerImageUrl: formData.bannerImageUrl || null
      };

      if (isEditing) {
        await apiClient.put(`/offers/${formData.id}`, payload);
      } else {
        await apiClient.post('/offers', payload);
      }
      setShowModal(false);
      fetchOffers();
    } catch (e) {
      alert('Error saving offer. Please verify inputs.');
    }
  };

  const deleteOffer = async (id: number) => {
    if (confirm('Cancel this offer? This will change status to Cancelled.')) {
      try {
        await apiClient.delete(`/offers/${id}`);
        fetchOffers();
      } catch (e) {
        alert('Failed to cancel offer.');
      }
    }
  };

  // Slot management functions
  const openSlotsManager = async (offer: any) => {
    setSelectedOfferForSlots(offer);
    setSlotFormData({
      slotDate: new Date().toISOString().split('T')[0],
      startTime: offer.startTime.slice(0, 5),
      endTime: offer.endTime.slice(0, 5),
      capacity: offer.totalCapacity
    });
    await fetchSlotsForOffer(offer.id);
    setShowSlotsModal(true);
  };

  const fetchSlotsForOffer = async (offerId: number) => {
    try {
      const res = await apiClient.get(`/offers/${offerId}/slots`);
      setSlots(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferForSlots) return;

    try {
      const payload = {
        offerId: selectedOfferForSlots.id,
        slotDate: new Date(slotFormData.slotDate).toISOString(),
        startTime: slotFormData.startTime + ':00',
        endTime: slotFormData.endTime + ':00',
        capacity: parseInt(slotFormData.capacity.toString()),
        status: 'Available'
      };

      await apiClient.post('/slots', payload);
      fetchSlotsForOffer(selectedOfferForSlots.id);
      fetchOffers(); // Refresh booked counts if any
    } catch (err) {
      alert('Failed to create slot.');
    }
  };

  const deleteSlot = async (slotId: number) => {
    if (confirm('Cancel this slot? This will change slot status to Cancelled.')) {
      try {
        await apiClient.delete(`/slots/${slotId}`);
        fetchSlotsForOffer(selectedOfferForSlots.id);
      } catch (err) {
        alert('Failed to cancel slot.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold">Manage Offers</h2>
          <p className="text-slate-500 dark:text-slate-400">Create, edit and cancel promotion campaigns</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:bg-indigo-700 transition transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((o) => (
          <div key={o.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-xl leading-snug">{o.title}</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  o.status === 'Active' ? 'bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  o.status === 'Draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                  o.status === 'Paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {o.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-semibold mb-4 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 inline-block">
                {o.category} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{o.offerPrice}</span> <span className="line-through opacity-50 font-normal ml-1">₹{o.originalPrice}</span>
              </p>
              
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar size={16} className="text-slate-400" /> 
                  {new Date(o.startDate).toLocaleDateString()} - {new Date(o.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={16} className="text-slate-400" />
                  {o.startTime.slice(0, 5)} - {o.endTime.slice(0, 5)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} className="text-slate-400" />
                  Max Booking: {o.maxBookingPerCustomer} slot(s) / customer
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
              <button 
                onClick={() => openSlotsManager(o)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition border border-indigo-100/30 dark:border-indigo-900/20"
              >
                Manage Slots ({o.slots?.length || 0})
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => openEditModal(o)}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Edit Offer"
                >
                  <Edit2 size={18} />
                </button>
                {o.status !== 'Cancelled' && (
                  <button 
                    onClick={() => deleteOffer(o.id)} 
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition"
                    title="Cancel Offer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold mb-6">{isEditing ? 'Edit Offer' : 'Create New Offer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Offer Title</label>
                  <input type="text" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Happy Hours Gym Trial" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category</label>
                  <select className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Gym</option>
                    <option>Restaurant</option>
                    <option>Salon</option>
                    <option>Clinic</option>
                    <option>Coaching</option>
                    <option>Turf</option>
                    <option>Spa</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Original Price (₹)</label>
                  <input type="number" min="0" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Offer Price (₹)</label>
                  <input type="number" min="0" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.offerPrice} onChange={e => setFormData({...formData, offerPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Start Date</label>
                  <input type="date" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">End Date</label>
                  <input type="date" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Daily Start Time</label>
                  <input type="time" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Daily End Time</label>
                  <input type="time" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Capacity Per Slot</label>
                  <input type="number" min="1" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.totalCapacity} onChange={e => setFormData({...formData, totalCapacity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Max Booking Per Customer</label>
                  <input type="number" min="1" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.maxBookingPerCustomer} onChange={e => setFormData({...formData, maxBookingPerCustomer: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Offer Status</label>
                  <select className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Paused</option>
                    <option>Expired</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5">Description</label>
                <textarea rows={3} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write a short description..." />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Terms & Conditions</label>
                <textarea rows={2} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.termsAndConditions} onChange={e => setFormData({...formData, termsAndConditions: e.target.value})} placeholder="e.g. Valid only for first-time customers..." />
              </div>

              {/* Offer Photos Manager */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Offer Photos</h4>
                
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="Paste image URL (e.g. Unsplash URL)" 
                    className="flex-1 p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    value={newImageUrl} 
                    onChange={e => setNewImageUrl(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newImageUrl.trim() !== '') {
                        if (!imgList.includes(newImageUrl.trim())) {
                          const updated = [...imgList, newImageUrl.trim()];
                          setImgList(updated);
                          if (!formData.bannerImageUrl) {
                            setFormData({ ...formData, bannerImageUrl: newImageUrl.trim() });
                          }
                        }
                        setNewImageUrl('');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition text-xs cursor-pointer"
                  >
                    Add Image
                  </button>
                </div>

                {imgList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {imgList.map((url, index) => {
                      const isBanner = formData.bannerImageUrl === url;
                      return (
                        <div key={index} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-video flex items-center justify-center">
                          <img src={url} alt="Offer Preview" className="w-full h-full object-cover" onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300';
                          }} />
                          
                          {isBanner && (
                            <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
                              Banner
                            </span>
                          )}

                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition duration-200">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = imgList.filter(u => u !== url);
                                setImgList(updated);
                                if (isBanner) {
                                  setFormData({ ...formData, bannerImageUrl: updated[0] || '' });
                                }
                              }}
                              className="self-end p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg transition"
                              title="Delete Photo"
                            >
                              <Trash2 size={12} />
                            </button>
                            
                            {!isBanner && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, bannerImageUrl: url })}
                                className="w-full py-1 text-[9px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white rounded-lg transition text-slate-800 dark:text-slate-200"
                              >
                                Set as Banner
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-7 py-2.5 text-sm bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slot Management Modal */}
      {showSlotsModal && selectedOfferForSlots && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-extrabold">Manage Offer Slots</h3>
                <p className="text-slate-500 dark:text-slate-400 font-semibold">{selectedOfferForSlots.title}</p>
              </div>
              <button onClick={() => setShowSlotsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition font-bold text-lg">×</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Slot Form */}
              <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 h-fit">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-1.5"><PlusCircle className="text-indigo-600" size={18} /> Add New Slot</h4>
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Slot Date</label>
                    <input type="date" required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={slotFormData.slotDate} onChange={e => setSlotFormData({...slotFormData, slotDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Start Time</label>
                    <input type="time" required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={slotFormData.startTime} onChange={e => setSlotFormData({...slotFormData, startTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">End Time</label>
                    <input type="time" required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={slotFormData.endTime} onChange={e => setSlotFormData({...slotFormData, endTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Capacity</label>
                    <input type="number" min="1" required className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={slotFormData.capacity} onChange={e => setSlotFormData({...slotFormData, capacity: parseInt(e.target.value)})} />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm shadow">
                    Add Slot
                  </button>
                </form>
              </div>

              {/* Slots List */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-bold text-lg">Active Slots ({slots.length})</h4>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(slot.slotDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                          {slot.bookedCount} booked / {slot.capacity} total ({slot.capacity - slot.bookedCount} available)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          slot.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {slot.status}
                        </span>
                        {slot.status !== 'Cancelled' && (
                          <button onClick={() => deleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-xl transition">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {slots.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500">
                      No slots generated for this offer. Add slots using the form on the left.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
