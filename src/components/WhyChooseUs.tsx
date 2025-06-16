
import React from 'react';
import { Shield, Truck, FileText, Users } from 'lucide-react';

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'OEM + Aftermarket Support',
      description: 'Access to both original equipment manufacturer parts and high-quality aftermarket alternatives'
    },
    {
      icon: Truck,
      title: 'Same-Day Delivery',
      description: 'Fast delivery across the UAE with same-day service available in major cities'
    },
    {
      icon: FileText,
      title: 'Transparent Bidding',
      description: 'See all vendor quotes upfront with detailed pricing and no hidden fees'
    },
    {
      icon: Users,
      title: 'Verified Vendors',
      description: 'All suppliers are thoroughly vetted and verified for quality and reliability'
    }
  ];

  return (
    <section className="section-spacing bg-white">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for Car Owners, Garages, and Enthusiasts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Why thousands of UAE customers trust EasyCarParts for their automotive needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-10 h-10 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
