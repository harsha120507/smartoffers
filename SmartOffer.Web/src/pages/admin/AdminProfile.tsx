import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Save, Building2, User, Phone, Mail, MapPin, Clock, Image } from 'lucide-react';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>({
    name: '',
    businessType: 'Gym',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    logoUrl: '',
    openingTime: '08:00:00',
    closingTime: '22:00:00'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/business');
      if (res.data && res.data.length > 0) {
        // Take the first business for this demo
        setBusiness(res.data[0]);
      } else {
        // No business exists, we will create one upon saving
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (business.id) {
        await apiClient.put(`/business/${business.id}`, business);
        alert('Profile updated successfully!');
      } else {
        const res = await apiClient.post('/business', business);
        setBusiness(res.data);
        alert('Profile created successfully!');
      }
    } catch (err) {
      alert('Failed to save profile. Make sure all fields are valid.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold">Business Profile</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage your business information and contact details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" /> Business Name
              </label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.name}
                onChange={e => setBusiness({ ...business, name: e.target.value })}
                placeholder="e.g. Iron Gym & Fitness"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" /> Business Type
              </label>
              <select
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.businessType}
                onChange={e => setBusiness({ ...business, businessType: e.target.value })}
              >
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

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Owner Name
              </label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.ownerName}
                onChange={e => setBusiness({ ...business, ownerName: e.target.value })}
                placeholder="Owner's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Phone size={16} className="text-slate-400" /> Phone Number
              </label>
              <input
                required
                type="tel"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.phone}
                onChange={e => setBusiness({ ...business, phone: e.target.value })}
                placeholder="10-digit number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Email Address
              </label>
              <input
                required
                type="email"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.email}
                onChange={e => setBusiness({ ...business, email: e.target.value })}
                placeholder="business@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Image size={16} className="text-slate-400" /> Logo URL (Optional)
              </label>
              <input
                type="url"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.logoUrl || ''}
                onChange={e => setBusiness({ ...business, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Opening Time
              </label>
              <input
                required
                type="time"
                step="1"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.openingTime}
                onChange={e => setBusiness({ ...business, openingTime: e.target.value.includes(':') && e.target.value.split(':').length === 2 ? e.target.value + ':00' : e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Closing Time
              </label>
              <input
                required
                type="time"
                step="1"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.closingTime}
                onChange={e => setBusiness({ ...business, closingTime: e.target.value.includes(':') && e.target.value.split(':').length === 2 ? e.target.value + ':00' : e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Street Address
              </label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.address}
                onChange={e => setBusiness({ ...business, address: e.target.value })}
                placeholder="e.g. 123 Main St, Sector 4"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> City
              </label>
              <input
                required
                type="text"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={business.city}
                onChange={e => setBusiness({ ...business, city: e.target.value })}
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
