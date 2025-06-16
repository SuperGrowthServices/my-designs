
import React from 'react';
import { Car, Search, MessageSquare, Truck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Car,
      title: 'Select Your Vehicle',
      description: 'Choose your car make, model, and year from our comprehensive database',
      color: 'bg-primary'
    },
    {
      icon: Search,
      title: 'Request a Part',
      description: 'Describe the specific part you need with details and part numbers if available',
      color: 'bg-mint'
    },
    {
      icon: MessageSquare,
      title: 'Receive Instant Quotes',
      description: 'Get competitive bids from verified vendors across the UAE within minutes',
      color: 'bg-blue-500'
    },
    {
      icon: Truck,
      title: 'Pay & Get Fast Delivery',
      description: 'Choose the best quote, pay securely, and get same-day delivery in most areas',
      color: 'bg-green-500'
    }
  ];

  return (
    <section id="how-it-works" className="section-spacing bg-gray-50">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How EasyCarParts Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the car parts you need in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
                  <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 w-2 h-2 bg-gray-300 rounded-full transform translate-x-1 -translate-y-0.5"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
