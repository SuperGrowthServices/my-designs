import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { VehicleStep } from './VehicleStep';
import { PartsStep } from './PartsStep';
import { ReviewStep } from './ReviewStep';
import { OrderModalHeader } from './OrderModalHeader';
import { Vehicle, Part } from './types';

interface OrderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const NewOrderModal: React.FC<OrderModalProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>({
    make: '', model: '', year: new Date().getFullYear(), vin: ''
  });

  const [currentPart, setCurrentPart] = useState<Part>({
    vehicleIndex: 0, partName: '', partNumber: '', description: '', quantity: 1, estimated_budget: ''
  });
  
  const handleClose = () => {
    setStep(1);
    setVehicles([]);
    setParts([]);
    setCurrentVehicle({ make: '', model: '', year: new Date().getFullYear(), vin: '' });
    setCurrentPart({ vehicleIndex: 0, partName: '', partNumber: '', description: '', quantity: 1, estimated_budget: '' });
    onOpenChange(false);
  };

  const addVehicle = () => {
    if (!currentVehicle.make || !currentVehicle.model) {
      toast({ title: "Missing vehicle information", description: "Please fill in make and model.", variant: "destructive" });
      return;
    }
    setVehicles([...vehicles, currentVehicle]);
    setCurrentVehicle({ make: '', model: '', year: new Date().getFullYear(), vin: '' });
  };

  const removeVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles);
    const newParts = parts.filter(part => part.vehicleIndex !== index)
      .map(part => ({ ...part, vehicleIndex: part.vehicleIndex > index ? part.vehicleIndex - 1 : part.vehicleIndex }));
    setParts(newParts);
  };

  const addPart = () => {
    if (!currentPart.partName) {
      toast({ title: "Missing part information", description: "Please enter the part name.", variant: "destructive" });
      return;
    }
    setParts([...parts, currentPart]);
    setCurrentPart({ ...currentPart, partName: '', partNumber: '', description: '', quantity: 1, estimated_budget: '' });
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    toast({ title: "Order Submitted!", description: "This is a frontend-only demo." });
    handleClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <VehicleStep vehicles={vehicles} currentVehicle={currentVehicle} setCurrentVehicle={setCurrentVehicle} onAddVehicle={addVehicle} onRemoveVehicle={removeVehicle} onNext={() => setStep(2)} />;
      case 2:
        return <PartsStep vehicles={vehicles} parts={parts} currentPart={currentPart} setCurrentPart={setCurrentPart} onAddPart={addPart} onRemovePart={removePart} onBack={() => setStep(1)} onNext={() => setStep(3)} />;
      case 3:
        return <ReviewStep vehicles={vehicles} parts={parts} onBack={() => setStep(2)} onSubmit={handleSubmitOrder} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] flex flex-col p-0">
        <OrderModalHeader currentStep={step} />
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 