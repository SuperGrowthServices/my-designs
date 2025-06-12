
import React from 'react';
import { Check } from 'lucide-react';

interface OrderModalHeaderProps {
  currentStep: number;
}

export const OrderModalHeader: React.FC<OrderModalHeaderProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Vehicles', description: 'Add your vehicles' },
    { number: 2, title: 'Parts', description: 'Specify needed parts' },
    { number: 3, title: 'Review', description: 'Confirm your order' }
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all ${
                  step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
