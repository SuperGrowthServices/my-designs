
import React, { useState } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import WhyChooseUs from '../components/WhyChooseUs';
import BrandGrid from '../components/BrandGrid';
import TestimonialsSection from '../components/TestimonialsSection';
import FinalCTA from '../components/FinalCTA';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-Optimized Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center flex-1 md:flex-none">
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">
                  EasyAutoParts.ae
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="hover:bg-primary hover:text-white border-primary text-primary text-sm lg:text-base px-4 lg:px-6"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    className="hover:bg-gray-50 text-sm lg:text-base px-4 lg:px-6"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 lg:px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-sm lg:text-base"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-10 w-10 p-0"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        navigate('/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-left h-12 px-3 text-base"
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-left h-12 px-3 text-base"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base btn-mobile"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero onGetStarted={handleGetStarted} />
        <HowItWorks />
        <WhyChooseUs />
        <BrandGrid />
        <TestimonialsSection />
        <FinalCTA onGetStarted={handleGetStarted} />
      </main>

      {/* Mobile-Optimized Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">EasyAutoParts.ae</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                UAE's premier automotive parts marketplace. Connecting car owners with verified suppliers for instant quotes and fast delivery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-300 text-sm md:text-base">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Become a Vendor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Legal</h4>
              <ul className="space-y-2 text-gray-300 text-sm md:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 lg:pt-8 text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2024 EasyAutoParts.ae. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Index;
