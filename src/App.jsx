import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Pages (Lazy Loaded for maximum performance)
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const RepairService = lazy(() => import('./pages/RepairService'));
const CscService = lazy(() => import('./pages/CscService'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <BreadcrumbProvider>
            {/* Global Styled Toaster Alerts */}
            <Toaster position="top-right" richColors expand={false} theme="light" />
            
            <div className="app-container">
              {/* Header Multilingual navigation */}
              <Navbar />

              {/* Breadcrumbs Navigation */}
              <Breadcrumbs />

              {/* Main Content Workspace */}
              <main className="main-content">
                <Suspense fallback={<Loader fullPage />}>
                  <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/repairs" element={<RepairService />} />
                  <Route path="/csc" element={<CscService />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />

                  {/* Separate logins for Admin & Partner */}
                  <Route path="/admin/admin_login" element={<AdminLogin />} />

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
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/history"
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <Profile />
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
