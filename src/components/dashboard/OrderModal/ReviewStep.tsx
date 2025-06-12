
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, CheckCircle, Car, Package, ChevronDown, ChevronRight } from 'lucide-react';

interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
}

interface Part {
  vehicleIndex: number;
  partName: string;
  partNumber: string;
  description: string;
  quantity: number;
}

interface ReviewStepProps {
  vehicles: Vehicle[];
  parts: Part[];
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  vehicles,
  parts,
  loading,
  onBack,
  onSubmit
}) => {
  const [expandedVehicles, setExpandedVehicles] = useState<Set<number>>(new Set([0]));

  const toggleVehicle = (vehicleIndex: number) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(vehicleIndex)) {
      newExpanded.delete(vehicleIndex);
    } else {
      newExpanded.add(vehicleIndex);
    }
    setExpandedVehicles(newExpanded);
  };

  const expandAll = () => {
    setExpandedVehicles(new Set(vehicles.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedVehicles(new Set());
  };

  const getPartsForVehicle = (vehicleIndex: number) => {
    return parts.filter(part => part.vehicleIndex === vehicleIndex);
  };

  const totalParts = parts.reduce((sum, part) => sum + part.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-primary mb-2">Review Your Order</h3>
        <p className="text-gray-600">Please review all details before submitting your order to vendors</p>
      </div>

      {/* Order Summary */}
      <Card className="border-2 border-green-100 bg-green-50/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
              <p className="text-sm text-gray-600">Vehicle{vehicles.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{parts.length}</p>
              <p className="text-sm text-gray-600">Part Type{parts.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalParts}</p>
              <p className="text-sm text-gray-600">Total Quantity</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={expandedVehicles.size === vehicles.length ? collapseAll : expandAll}
              >
                {expandedVehicles.size === vehicles.length ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles and Parts List */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-primary">
            <Package className="w-5 h-5 mr-2" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-60 w-full">
            <div className="space-y-1">
              {vehicles.map((vehicle, vehicleIndex) => {
                const vehicleParts = getPartsForVehicle(vehicleIndex);
                const isExpanded = expandedVehicles.has(vehicleIndex);
                
                return (
                  <Collapsible 
                    key={vehicleIndex} 
                    open={isExpanded}
                    onOpenChange={() => toggleVehicle(vehicleIndex)}
                  >
                    <CollapsibleTrigger className="w-full hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Car className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </p>
                            {vehicle.vin && (
                              <p className="text-xs text-gray-600">VIN: {vehicle.vin}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                            {vehicleParts.length} part{vehicleParts.length !== 1 ? 's' : ''}
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="bg-gray-50 border-b border-gray-100">
                        {vehicleParts.length > 0 ? (
                          <div className="space-y-1 p-2">
                            {vehicleParts.map((part, partIndex) => (
                              <div key={partIndex} className="flex items-center justify-between p-2 mx-2 bg-white rounded border border-gray-100">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <div className="w-3 h-3 bg-green-500/20 rounded flex items-center justify-center">
                                    <Package className="w-2 h-2 text-green-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate text-sm">{part.partName}</p>
                                    {part.partNumber && (
                                      <p className="text-xs text-gray-600">Part #: {part.partNumber}</p>
                                    )}
                                    {part.description && (
                                      <p className="text-xs text-gray-500 truncate">{part.description}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                  Qty: {part.quantity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No parts added for this vehicle
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="border-2 border-green-100 bg-green-50/50">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-semibold text-lg text-green-800 mb-2">What happens next?</h4>
            <p className="text-green-700 mb-4 text-sm">
              Once you submit this order, verified vendors will start bidding on your parts. 
              You'll receive notifications and can compare prices before making your final decision.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-green-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Vendor bidding starts
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Compare prices
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Choose best offer
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Navigation */}
      <div className="flex justify-between pt-4 border-t bg-white">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Parts
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
          size="lg"
        >
          {loading ? 'Submitting Order...' : 'Submit Order to Vendors'}
        </Button>
      </div>
    </div>
  );
};
