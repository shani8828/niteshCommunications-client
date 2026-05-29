import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';

// Reusable Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

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

// Role Login Pages
import AdminLogin from './pages/AdminLogin';
import PartnerLogin from './pages/PartnerLogin';

// Dashboards
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
            {/* Global Styled Toaster Alerts */}
            <Toaster position="top-right" richColors expand={false} />
            
            <div className="app-container">
              {/* Header Multilingual navigation */}
              <Navbar />

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

                  {/* Separate logins for Admin & Partner */}
                  <Route path="/admin/admin_login" element={<AdminLogin />} />
                  <Route path="/partner/partner_login" element={<PartnerLogin />} />

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

                  {/* Delivery Partner Dashboard */}
                  <Route
                    path="/partner/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['partner']}>
                        <PartnerDashboard />
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
            </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
