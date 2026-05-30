import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
  const [crumbs, setCrumbs] = useState(null);
  const location = useLocation();

  // Reset custom crumbs on route change
  useEffect(() => {
    setCrumbs(null);
  }, [location.pathname]);

  return (
    <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};

export default BreadcrumbContext;
