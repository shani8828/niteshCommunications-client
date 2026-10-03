import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { Toaster } from 'sonner';

// Reusable Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import Breadcrumbs from './components/common/Breadcrumbs';
import Loader from './components/common/Loader';
import CookieConsent from './components/common/CookieConsent';
import LanguageToggle from './components/common/LanguageToggle';
import { loadPageTranslations } from './i18n';

// Load a page's code and its translations in parallel, so a page never
// renders before its text is ready and there is no extra round-trip.
const lazyPage = (importPage) =>
  lazy(() => Promise.all([importPage(), loadPageTranslations()]).then(([page]) => page));

// Pages (Lazy Loaded for maximum performance)
const Home = lazyPage(() => import('./pages/Home'));
const Shop = lazyPage(() => import('./pages/Shop'));
const ProductDetails = lazyPage(() => import('./pages/ProductDetails'));
const ProductRedirect = lazyPage(() => import('./components/common/ProductRedirect'));
const Cart = lazyPage(() => import('./pages/Cart'));
const Checkout = lazyPage(() => import('./pages/Checkout'));
const OrderTracking = lazyPage(() => import('./pages/OrderTracking'));
const RepairService = lazyPage(() => import('./pages/RepairService'));
const CscService = lazyPage(() => import('./pages/CscService'));
const Login = lazyPage(() => import('./pages/Login'));
const NotFound = lazyPage(() => import('./pages/NotFound'));
const TermsConditions = lazyPage(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazyPage(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazyPage(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazyPage(() => import('./pages/ShippingPolicy'));
const Profile = lazyPage(() => import('./pages/Profile'));
const Orders = lazyPage(() => import('./pages/Orders'));
const Wishlist = lazyPage(() => import('./pages/Wishlist'));
const RepairBookings = lazyPage(() => import('./pages/RepairBookings'));
const AdminLogin = lazyPage(() => import('./pages/AdminLogin'));
const AdminDashboard = lazyPage(() => import('./pages/AdminDashboard'));
const OrderReturn = lazyPage(() => import('./pages/OrderReturn'));
const OrderReplace = lazyPage(() => import('./pages/OrderReplace'));
const RepairCancel = lazyPage(() => import('./components/repair/RepairCancel'));
// import Loader from './components/common/Loader';

function App() {
  // Once the browser is idle, warm up the pages shoppers usually open next
  useEffect(() => {
    const warmUp = () => {
      import('./pages/ProductDetails');
      import('./pages/Cart');
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warmUp, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(warmUp, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 1. Inject global Organization schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Nitesh Communications",
      "url": "https://www.niteshcom.in",
      "logo": "https://www.niteshcom.in/branding/logo.png",
      "description": "E-Commerce, Mobile Repairing, and Common Service Centre in Ayodhya",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Karamdanda Mod, Patkhauli Chauraha",
        "addressLocality": "Ayodhya",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "224001",
        "addressCountry": "IN"
      },
      "telephone": "+919125949456"
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Nitesh Communications",
      "url": "https://www.niteshcom.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.niteshcom.in/shop?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    let orgScript = document.getElementById("org-jsonld");
    if (!orgScript) {
      orgScript = document.createElement("script");
      orgScript.id = "org-jsonld";
      orgScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(orgScript);
    }
    orgScript.textContent = JSON.stringify(orgSchema);

    let webScript = document.getElementById("web-jsonld");
    if (!webScript) {
      webScript = document.createElement("script");
      webScript.id = "web-jsonld";
      webScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(webScript);
    }
    webScript.textContent = JSON.stringify(websiteSchema);

    return () => {
      if (orgScript) orgScript.remove();
      if (webScript) webScript.remove();
    };
  }, []);

  return (
    // v7_startTransition keeps the current page on screen while the next page's
    // code loads, instead of flashing the full-page loader on every navigation.
    <Router future={{ v7_startTransition: true }}>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <BreadcrumbProvider>
            {/* Global Styled Toaster Alerts */}
            <Toaster position="top-center" richColors expand={false} theme="light" />
            
            <div className="app-container">
              {/* Header Multilingual navigation */}
              <Navbar />

              {/* Floating Language Toggle */}
              <LanguageToggle />

              {/* Breadcrumbs Navigation */}
              <Breadcrumbs />

              {/* Main Content Workspace */}
              <main className="main-content">
                <Suspense fallback={<Loader fullPage />}>
                  <Routes>
                  {/* Public routes */}
                  <Route path="/home" element={<Home />} />
                  <Route path="/" element={<Navigate to="/shop" replace />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductRedirect />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/products/:categorySlug/:slug" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/repairs" element={<RepairService />} />
                  <Route path="/csc" element={<CscService />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Navigate to="/login" replace />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
{/* <Route path='/loader' element={<Loader fullPage/>}/> */}
                  {/* Separate logins for Admin & Partner */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Customer-only protected routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:id"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:id/return"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <OrderReturn />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:id/replace"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <OrderReplace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/repair-bookings"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <RepairBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/repairs/:id/cancel"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <RepairCancel />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/order-tracking/history"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />



                  {/* Administrator Control Panel */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Wildcard 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

              {/* Footer Contacts & Maps info */}
              <Footer />

              {/* Cookie & Terms Consent Banner */}
              <CookieConsent />
            </div>
          </BreadcrumbProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
