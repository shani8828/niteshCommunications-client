import React from 'react';
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

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import RepairService from './pages/RepairService';
import CscService from './pages/CscService';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Profile from './pages/Profile';

import AdminLogin from './pages/AdminLogin';
import CookieConsent from './components/common/CookieConsent';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';

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
