
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Abdul Rahman',
      location: 'Dubai Workshop',
      rating: 5,
      text: 'We sourced rare Land Cruiser parts in 3 hours. Incredible! The vendor network is amazing and prices are competitive.',
      avatar: '👨‍🔧'
    },
    {
      name: 'Lisa Johnson',
      location: 'Sharjah',
      rating: 5,
      text: 'Vendors bid competitively — got better deals than calling garages directly. The transparency is refreshing.',
      avatar: '👩‍💼'
    },
    {
      name: 'Mohammed Al-Rashid',
      location: 'Abu Dhabi',
      rating: 5,
      text: 'Same-day delivery for my BMW parts. Professional service and genuine quality parts. Highly recommended!',
      avatar: '👨‍💼'
    }
  ];

  return (
    <section className="section-spacing bg-gray-50">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers across the UAE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                <p className="text-gray-700 leading-relaxed italic pl-6">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center">
                <div className="text-2xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
