
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';
import PartRequestModal from './PartRequestModal';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHowItWorksClick = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618644-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 md:mb-6 animate-fade-in leading-tight">
                  Find the Exact Car Part.
                  <span className="block text-primary mt-2">
                    Instantly.
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in leading-relaxed">
                  From headlights to engine blocks — trusted UAE vendors, instant quotes, and rapid delivery.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-fade-in">
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto btn-mobile"
                  >
                    Start Your Order
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={handleHowItWorksClick}
                    className="border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-lg transition-all duration-300 w-full sm:w-auto btn-mobile"
                  >
                    <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                    How It Works
                  </Button>
                </div>
              </div>

              {/* Right Column - Visual Element */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm lg:text-base">1</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm lg:text-base">Select Your Vehicle</h3>
                          <p className="text-xs lg:text-sm text-gray-600">Choose make, model & year</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-mint rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm lg:text-base">2</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm lg:text-base">Request a Part</h3>
                          <p className="text-xs lg:text-sm text-gray-600">Describe what you need</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm lg:text-base">3</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm lg:text-base">Get Instant Quotes</h3>
                          <p className="text-xs lg:text-sm text-gray-600">Compare vendor prices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile-Optimized Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-2 md:h-3 bg-primary rounded-full mt-1 md:mt-2"></div>
          </div>
        </div>
      </section>
      
      <PartRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Hero;
