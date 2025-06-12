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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/dashboarddesign" element={<DashboardDesign />} />
              <Route path="/vendordesign" element={<VendorDesign />} />
              <Route path="/checkout/:orderId" element={<CheckoutPage />} />
              <Route path="/payment-success" element={<PaymentConfirmation />} />
              <Route path="/receipt/:orderId" element={<PaymentReceipt />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
