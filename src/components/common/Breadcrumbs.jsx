import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs } from '../../context/BreadcrumbContext';

const Breadcrumbs = () => {
  const { t } = useTranslation();
  const { crumbs } = useBreadcrumbs();
  const location = useLocation();
  const pathname = location.pathname;

  // Don't render on Home page
  if (pathname === '/') {
    return null;
  }

  // Helper to translate path segments
  const getTranslationKey = (segment) => {
    switch (segment.toLowerCase()) {
      case 'shop':
      case 'products':
        return t('common:shop');
      case 'cart':
        return t('common:cart');
      case 'checkout':
        return t('common:checkout', 'Checkout');
      case 'repairs':
        return t('common:repair');
      case 'csc':
        return t('common:csc');
      case 'login':
        return t('common:login');
      case 'register':
        return t('common:register');
      case 'profile':
        return t('common:profile');
      case 'terms-conditions':
        return t('common:terms_conditions');
      case 'privacy-policy':
        return t('common:privacy_policy');
      case 'refund-policy':
        return t('common:refund_policy');
      case 'shipping-policy':
        return t('common:shipping_policy');
      case 'admin':
        return t('common:admin', 'Admin');
      case 'admin_login':
        return t('common:admin_login', 'Admin Login');
      case 'dashboard':
        return t('common:dashboard', 'Dashboard');
      case 'history':
      case 'orders':
        return t('common:order_summary');
      case 'order-tracking':
        return t('common:order_tracking', 'Order Tracking');
      case 'wishlist':
        return t('common:wishlist');
      case 'repair-bookings':
        return t('common:repairs');
      default:
        // Capitalize segment if translation is missing
        return segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  let items = [];

  if (crumbs) {
    items = crumbs;
  } else if (pathname === '/order-tracking/history' || pathname === '/orders') {
    items = [
      { label: t('common:order_summary'), link: '/orders' }
    ];
  } else if (pathname === '/wishlist') {
    items = [
      { label: t('common:wishlist'), link: '/wishlist' }
    ];
  } else if (pathname === '/repair-bookings') {
    items = [
      { label: t('common:repairs'), link: '/repair-bookings' }
    ];
  } else if (pathname === '/checkout') {
    items = [
      { label: t('common:cart'), link: '/cart' },
      { label: t('common:checkout', 'Checkout'), link: '/checkout' }
    ];
  } else {
    // Generate crumbs automatically from path segments
    const segments = pathname.split('/').filter((x) => x);
    let currentPath = '';
    
    items = segments.map((segment) => {
      currentPath += `/${segment}`;
      const isId = /^[0-9a-fA-F]{24}$/.test(segment);
      const label = isId ? 'Details' : getTranslationKey(segment);

      return {
        label,
        link: currentPath,
      };
    });
  }

  // Prepend Home link
  const allCrumbs = [
    { label: t('common:home'), link: '/' },
    ...items,
  ];

  return (
    <div className="bg-slate-50/50 border-b border-slate-100 py-3 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500">
        {allCrumbs.map((crumb, index) => {
          const isLast = index === allCrumbs.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-slate-400 mx-0.5 flex-shrink-0" />}
              {isLast ? (
                <span className="text-blue-600 font-bold truncate max-w-[200px]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.link}
                  className="hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-slate-500 hover:underline"
                >
                  {index === 0 && <Home size={14} className="mb-0.5 flex-shrink-0" />}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Breadcrumbs;
