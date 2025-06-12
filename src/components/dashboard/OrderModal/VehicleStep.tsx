
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { carManufacturers } from '@/utils/carManufacturers';
import { Plus, X, ArrowRight, Car } from 'lucide-react';

interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface VehicleStepProps {
  vehicles: Vehicle[];
  currentVehicle: Vehicle;
  setCurrentVehicle: React.Dispatch<React.SetStateAction<Vehicle>>;
  onAddVehicle: () => void;
  onRemoveVehicle: (index: number) => void;
  onNext: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  vehicles,
  currentVehicle,
  setCurrentVehicle,
  onAddVehicle,
  onRemoveVehicle,
  onNext
}) => {
  const canProceed = vehicles.length > 0;

  return (
    <div className="space-y-6">
      {/* Add Vehicle Form - Compact */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-primary">
            <Car className="w-5 h-5 mr-2" />
            Add Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SearchableSelect
                id="make"
                label="Make *"
                options={carManufacturers}
                value={currentVehicle.make}
                onChange={(value) => setCurrentVehicle(prev => ({ ...prev, make: value }))}
                placeholder="Select or type car make"
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="e.g., Camry, X5, Mustang"
                value={currentVehicle.model}
                onChange={(e) => setCurrentVehicle(prev => ({ ...prev, model: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2020"
                value={currentVehicle.year}
                onChange={(e) => setCurrentVehicle(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                placeholder="17-character VIN"
                value={currentVehicle.vin}
                onChange={(e) => setCurrentVehicle(prev => ({ ...prev, vin: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={onAddVehicle} 
            className="w-full bg-primary hover:bg-primary/90 text-white py-2"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle to Order
          </Button>
        </CardContent>
      </Card>

      {/* Added Vehicles List */}
      {vehicles.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg text-primary mb-3">
            Added Vehicles ({vehicles.length})
          </h4>
          <Card className="border border-gray-200">
            <ScrollArea className="h-60 w-full">
              <div className="p-3 space-y-2">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Car className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </p>
                        {vehicle.vin && (
                          <p className="text-xs text-gray-600">VIN: {vehicle.vin}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveVehicle(index)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300 h-7 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Fixed Navigation */}
      <div className="flex justify-end pt-4 border-t bg-white">
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="bg-primary hover:bg-primary/90 text-white px-8"
          size="lg"
        >
          Next: Add Parts <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
