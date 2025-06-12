
import React from 'react';

const BrandGrid = () => {
  const brands = [
    { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Toyota-Logo.svg/200px-Toyota-Logo.svg.png' },
    { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Honda_logo.svg/200px-Honda_logo.svg.png' },
    { name: 'Nissan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Nissan-logo.svg/200px-Nissan-logo.svg.png' },
    { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png' },
    { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png' },
    { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png' },
    { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/200px-Ford_logo_flat.svg.png' },
    { name: 'Hyundai', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png' },
    { name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png' },
    { name: 'Chevrolet', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Chevrolet-logo.svg/200px-Chevrolet-logo.svg.png' },
    { name: 'Kia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kia-logo-2021.svg/200px-Kia-logo-2021.svg.png' },
    { name: 'Mazda', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Mazda_logo.svg/200px-Mazda_logo.svg.png' },
    { name: 'Subaru', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Subaru_logo.svg/200px-Subaru_logo.svg.png' },
    { name: 'Mitsubishi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mitsubishi_logo.svg/200px-Mitsubishi_logo.svg.png' },
    { name: 'Lexus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lexus_logo_2005.svg/200px-Lexus_logo.svg.png' },
    { name: 'Infiniti', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Infiniti_logo.svg/200px-Infiniti_logo.svg.png' },
    { name: 'Acura', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Acura_logo.svg/200px-Acura_logo.svg.png' },
    { name: 'Land Rover', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Land_Rover_logo.svg/200px-Land_Rover_logo.svg.png' },
    { name: 'Jeep', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Jeep_logo.svg/200px-Jeep_logo.svg.png' },
    { name: 'Porsche', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Porsche_logo.svg/200px-Porsche_logo.svg.png' },
  ];

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = event.currentTarget;
    const fallbackElement = imgElement.parentElement?.querySelector('.fallback-text') as HTMLElement;
    
    imgElement.style.display = 'none';
    if (fallbackElement) {
      fallbackElement.style.display = 'block';
    }
  };

  return (
    <section className="section-spacing bg-white">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by 100s of Verified UAE Sellers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We support 50+ major manufacturers — from Toyota and Hyundai to Bentley and MG. 
            Connect with verified vendors across the UAE for genuine and aftermarket parts.
          </p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-8 mb-12">
          {brands.map((brand, index) => (
            <div 
              key={brand.name}
              className="brand-logo bg-white rounded-lg p-4 shadow-sm hover:shadow-lg flex flex-col items-center justify-center h-20 cursor-pointer border border-gray-100"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img 
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="max-h-8 max-w-full object-contain"
                onError={handleImageError}
              />
              <span 
                className="fallback-text text-xs font-medium text-gray-700 hidden"
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 text-lg">
            And 480+ more verified suppliers across the UAE
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandGrid;
