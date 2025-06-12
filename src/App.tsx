import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import { CheckoutPage } from "./components/checkout/CheckoutPage";
import { PaymentConfirmation } from "./components/checkout/PaymentConfirmation";
import { PaymentReceipt } from "./components/checkout/PaymentReceipt";
import DashboardDesign from './pages/DashboardDesign';
import VendorDesign from './pages/VendorDesign';
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Protected Buyer Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Vendor Routes */}
              <Route path="/vendor" element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Other Protected Routes */}
              <Route path="/checkout/:orderId" element={
                <ProtectedRoute allowedRoles={['buyer', 'vendor', 'admin']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              
              <Route path="/payment-success" element={
                <ProtectedRoute allowedRoles={['buyer', 'vendor', 'admin']}>
                  <PaymentConfirmation />
                </ProtectedRoute>
              } />
              
              <Route path="/receipt/:orderId" element={
                <ProtectedRoute allowedRoles={['buyer', 'vendor', 'admin']}>
                  <PaymentReceipt />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
