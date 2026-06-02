import React from 'react';
import { ShoppingBag, User, Heart, Wrench } from 'lucide-react';

const ProfileSidebar = ({ activeTab, setActiveTab, isHindi }) => {
  return (
    <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
      <button
        onClick={() => setActiveTab('orders')}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === 'orders'
            ? 'bg-blue-50 text-blue-600 border border-blue-50'
            : 'hover:bg-slate-100 text-slate-600'
        }`}
      >
        <ShoppingBag size={16} /> {isHindi ? 'मेरे ऑर्डर्स' : 'My Orders'}
      </button>
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-blue-50 text-blue-600 border border-blue-50'
            : 'hover:bg-slate-100 text-slate-600'
        }`}
      >
        <User size={16} /> {isHindi ? 'प्रोफाइल एडिट करें' : 'Edit Profile'}
      </button>
      <button
        onClick={() => setActiveTab('wishlist')}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === 'wishlist'
            ? 'bg-blue-50 text-blue-600 border border-blue-50'
            : 'hover:bg-slate-100 text-slate-600'
        }`}
      >
        <Heart size={16} /> {isHindi ? 'मेरी विशलिस्ट' : 'My Wishlist'}
      </button>
      <button
        onClick={() => setActiveTab('repairs')}
        className={`flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-0 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
          activeTab === 'repairs'
            ? 'bg-blue-50 text-blue-600 border border-blue-50'
            : 'hover:bg-slate-100 text-slate-600'
        }`}
      >
        <Wrench size={16} /> {isHindi ? 'रिपेयर बुकिंग्स' : 'Repair Bookings'}
      </button>
    </aside>
  );
};

export default React.memo(ProfileSidebar);
