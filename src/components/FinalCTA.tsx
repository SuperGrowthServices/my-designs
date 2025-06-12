
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="section-spacing bg-primary">
      <div className="container-responsive">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Get your car part quote in under 2 minutes
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            No credit card required, instant access. Join thousands of satisfied customers across the UAE.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Start Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center text-blue-100">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm">Average response time: 15 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
