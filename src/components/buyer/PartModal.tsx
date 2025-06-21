import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Part } from "@/data/buyerDashboardMockData";
import { X } from "lucide-react";
import { ImageCarousel } from "./ImageCarousel";
import { Vehicle } from "@/data/buyerDashboardMockData";

interface PartModalProps {
  part: Part | null;
  vehicles: Vehicle[];
  onOpenChange: (part: Part | null) => void;
}

export function PartModal({ part, vehicles, onOpenChange }: PartModalProps) {
  if (!part) return null;

  const vehicle = vehicles.find(v => v.id === part.vehicleId);
  const isPartConfirmed = part.status === 'CONFIRMED' || part.status === 'OUT_FOR_DELIVERY' || part.status === 'DELIVERED' || part.status === 'REFUNDED';

  return (
    <Dialog open={!!part} onOpenChange={() => onOpenChange(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <DialogTitle className="text-2xl font-bold">{part.name}</DialogTitle>
                        {vehicle && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {vehicle.make} {vehicle.model} – VIN: {vehicle.vin || 'N/A'}
                            </p>
                        )}
                    </div>
                    <div className="flex items-start gap-3 ml-4">
                        <StatusBadge status={part.status} />
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                {/* Part Information Block - Always Visible */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 text-lg">Part Information</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-medium">{part.quantity}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Condition</p>
                            <p className="font-medium">{part.condition}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Warranty</p>
                            <p className="font-medium">{part.warranty}</p>
                        </div>
                        {part.partNumber && (
                            <div>
                                <p className="text-sm text-muted-foreground">Part Number</p>
                                <p className="font-medium">{part.partNumber}</p>
                            </div>
                        )}
                        {part.customerBudget && (
                            <div>
                                <p className="text-sm text-muted-foreground">Customer Budget</p>
                                <p className="font-medium">AED {part.customerBudget}</p>
                            </div>
                        )}
                    </div>
                    {part.notes && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">Buyer Notes</p>
                            <p className="text-sm mt-1">{part.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sourcer Info Block - Only for Confirmed/Out for Delivery/Delivered */}
                {isPartConfirmed && part.sourcer && (
                    <div className="bg-muted border rounded-lg p-6">
                        <h3 className="font-semibold mb-4 text-lg">Sourcer Information</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Accepted Price</p>
                                <p className="font-bold text-lg">AED {part.price}</p>
                            </div>
                            {part.sourcer.sourcerNotes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Sourcer Notes</p>
                                    <p className="text-sm mt-1">{part.sourcer.sourcerNotes}</p>
                                </div>
                            )}
                            
                            {/* Sourcer Images - Only if images exist */}
                            {part.sourcerPhotos && part.sourcerPhotos.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-3">Images</p>
                                    <ImageCarousel 
                                        photos={part.sourcerPhotos} 
                                        isConfirmed={isPartConfirmed} 
                                        uploadedImageUrl={part.sourcer?.uploadedImageUrl} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {part.status === 'REFUNDED' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <p className="font-bold text-orange-800">❗ This part was refunded by your Account Manager.</p>
                        <p className="text-sm text-orange-700">You were not charged for this item.</p>
                        {part.refundStatus && <p className="text-xs text-muted-foreground mt-2">{part.refundStatus}</p>}
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
} 