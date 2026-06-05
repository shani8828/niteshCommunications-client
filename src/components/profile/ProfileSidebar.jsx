import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, User, Heart, Wrench } from 'lucide-react';

const ProfileSidebar = ({ isHindi }) => {
  const getLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-50 text-blue-600 border-blue-50 font-bold'
        : 'hover:bg-slate-100 text-slate-600 border-transparent'
    }`;

  return (
    <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 h-fit w-full lg:w-[240px] flex-shrink-0">
      <NavLink
        to="/orders"
        className={getLinkClass}
      >
        <ShoppingBag size={16} /> {isHindi ? 'ऑर्डर्स' : 'Orders'}
      </NavLink>
      <NavLink
        to="/profile"
        className={getLinkClass}
      >
        <User size={16} /> {isHindi ? 'प्रोफाइल एडिट करें' : 'Edit Profile'}
      </NavLink>
      <NavLink
        to="/wishlist"
        className={getLinkClass}
      >
        <Heart size={16} /> {isHindi ? 'मेरी विशलिस्ट' : 'My Wishlist'}
      </NavLink>
      <NavLink
        to="/repair-bookings"
        className={getLinkClass}
      >
        <Wrench size={16} /> {isHindi ? 'रिपेयर बुकिंग्स' : 'Repair Bookings'}
      </NavLink>
    </aside>
  );
};

export default React.memo(ProfileSidebar);
