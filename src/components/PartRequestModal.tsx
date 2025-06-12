
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface PartRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartRequestModal = ({ isOpen, onClose }: PartRequestModalProps) => {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const carMakes = [
    'BMW', 'Mercedes', 'Audi', 'Toyota', 'Nissan', 'Honda', 'Ford', 
    'Chevrolet', 'Hyundai', 'Kia', 'Volkswagen', 'Porsche'
  ];

  const carModels = [
    '3 Series', 'C-Class', 'A4', 'Camry', 'Altima', 'Accord', 
    'F-150', 'Silverado', 'Elantra', 'Optima', 'Golf', '911'
  ];

  const years = Array.from({ length: 25 }, (_, i) => (2024 - i).toString());

  const handleStartSearch = () => {
    toast({
      title: "Login Required",
      description: "Please login to continue your search",
      duration: 3000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary mb-4">
            Find Your Car Part
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Make
              </label>
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select car make" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {carMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select car model" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {carModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleStartSearch}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg"
          >
            Start Your Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartRequestModal;
