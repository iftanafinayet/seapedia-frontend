import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import SellerLayout from './layouts/SellerLayout'
import DriverLayout from './layouts/DriverLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './features/auth/ProtectedRoute'
import ToastContainer from './components/ui/Toast'
import ScrollToTop from './components/ScrollToTop'
import SplashScreen from './components/shared/SplashScreen'

// Auth
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import RoleSelectionPage from './features/auth/RoleSelectionPage'

// Guest
import LandingPage from './features/guest/LandingPage'
import ProductListPage from './features/guest/ProductListPage'
import ProductDetailPage from './features/guest/ProductDetailPage'
import ReviewSection from './features/guest/ReviewSection'
import StorePage from './features/guest/StorePage'

// Buyer
import BuyerDashboard from './features/buyer/BuyerDashboard'
import WalletPage from './features/buyer/WalletPage'
import AddressPage from './features/buyer/AddressPage'
import CartPage from './features/buyer/CartPage'
import CheckoutPage from './features/buyer/CheckoutPage'
import BuyerOrderListPage from './features/buyer/OrderListPage'
import BuyerOrderDetailPage from './features/buyer/OrderDetailPage'
import BuyerReportPage from './features/buyer/BuyerReportPage'

// Seller
import SellerDashboard from './features/seller/SellerDashboard'
import SellerStorePage from './features/seller/StorePage'
import ProductManagePage from './features/seller/ProductManagePage'
import SellerOrderListPage from './features/seller/OrderListPage'
import SellerOrderDetailPage from './features/seller/OrderDetailPage'
import ReportPage from './features/seller/ReportPage'

// Driver
import DriverDashboard from './features/driver/DriverDashboard'
import JobBoardPage from './features/driver/JobBoardPage'
import JobDetailPage from './features/driver/JobDetailPage'
import HistoryPage from './features/driver/HistoryPage'

// Admin
import AdminDashboard from './features/admin/AdminDashboard'
import VoucherPage from './features/admin/VoucherPage'
import OverduePage from './features/admin/OverduePage'
import SimulatePage from './features/admin/SimulatePage'
import DealOfTheDayPage from './features/admin/DealOfTheDayPage'
import HeroEditorPage from './features/admin/HeroEditorPage'

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSplash]);

  const handleSplashDone = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/reviews" element={<ReviewSection />} />
          <Route path="/stores/:id" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/choose-role" element={
            <ProtectedRoute><RoleSelectionPage /></ProtectedRoute>
          } />
          {/* Orders & Cart - accessible to all, shows login bridge for guests */}
          <Route path="/buyer/orders" element={<BuyerOrderListPage />} />
          <Route path="/buyer/orders/:id" element={<BuyerOrderDetailPage />} />
          <Route path="/buyer/cart" element={<CartPage />} />
        </Route>

        {/* Dashboard Routes (Buyer) */}
        <Route element={<DashboardLayout />}>
          {/* Buyer */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute role="Buyer"><BuyerDashboard /></ProtectedRoute>
          } />
          <Route path="/buyer/wallet" element={
            <ProtectedRoute role="Buyer"><WalletPage /></ProtectedRoute>
          } />
          <Route path="/buyer/addresses" element={
            <ProtectedRoute role="Buyer"><AddressPage /></ProtectedRoute>
          } />
          <Route path="/buyer/checkout" element={
            <ProtectedRoute role="Buyer"><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/buyer/reports" element={
            <ProtectedRoute role="Buyer"><BuyerReportPage /></ProtectedRoute>
          } />

        </Route>

        {/* Admin Routes (sidebar layout) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/vouchers" element={
            <ProtectedRoute role="Admin"><VoucherPage /></ProtectedRoute>
          } />
          <Route path="/admin/overdue" element={
            <ProtectedRoute role="Admin"><OverduePage /></ProtectedRoute>
          } />
          <Route path="/admin/simulate" element={
            <ProtectedRoute role="Admin"><SimulatePage /></ProtectedRoute>
          } />
          <Route path="/admin/deals" element={
            <ProtectedRoute role="Admin"><DealOfTheDayPage /></ProtectedRoute>
          } />
          <Route path="/admin/hero" element={
            <ProtectedRoute role="Admin"><HeroEditorPage /></ProtectedRoute>
          } />
        </Route>

        {/* Driver Routes (topbar layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/driver" element={
            <ProtectedRoute role="Driver"><DriverDashboard /></ProtectedRoute>
          } />
          <Route path="/driver/dashboard" element={
            <ProtectedRoute role="Driver"><DriverDashboard /></ProtectedRoute>
          } />
          <Route path="/driver/jobs/:id" element={
            <ProtectedRoute role="Driver"><JobDetailPage /></ProtectedRoute>
          } />
        </Route>

        {/* Seller Routes (sidebar layout, no topbar) */}
        <Route element={<SellerLayout />}>
          <Route path="/seller" element={
            <ProtectedRoute role="Seller"><SellerDashboard /></ProtectedRoute>
          } />
          <Route path="/seller/dashboard" element={
            <ProtectedRoute role="Seller"><SellerDashboard /></ProtectedRoute>
          } />
          <Route path="/seller/store" element={
            <ProtectedRoute role="Seller"><SellerStorePage /></ProtectedRoute>
          } />
          <Route path="/seller/products" element={
            <ProtectedRoute role="Seller"><ProductManagePage /></ProtectedRoute>
          } />
          <Route path="/seller/orders" element={
            <ProtectedRoute role="Seller"><SellerOrderListPage /></ProtectedRoute>
          } />
          <Route path="/seller/orders/:id" element={
            <ProtectedRoute role="Seller"><SellerOrderDetailPage /></ProtectedRoute>
          } />
          <Route path="/seller/reports" element={
            <ProtectedRoute role="Seller"><ReportPage /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </>
  )
}
