import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { VehicleGroup } from "./VehicleGroup";
import { TopCards } from "./TopCards";
import {
  mockVehicles,
  getPartsByVehicleId,
  Part,
} from "@/data/buyerDashboardMockData";

export const DashboardTab = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = mockVehicles
    .filter((vehicle) => {
      const parts = getPartsByVehicleId(vehicle.id);
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          parts.some((part) => part.name.toLowerCase().includes(searchLower) || 
                             part.orderId.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => a.make.localeCompare(b.make));

  const activeVehicles = filteredVehicles.filter(vehicle => {
    const parts = getPartsByVehicleId(vehicle.id);
    return parts.some(part => part.status !== 'DELIVERED' && part.status !== 'REFUNDED' && part.status !== 'CANCELLED');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search orders..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      <TopCards />

      <div className="space-y-4">
        {activeVehicles.length > 0 ? (
          activeVehicles.map((vehicle) => {
            const allParts = getPartsByVehicleId(vehicle.id);
            const activeParts = allParts.filter(part => 
                part.status === 'PENDING' || 
                part.status === 'CONFIRMED' || 
                part.status === 'OUT_FOR_DELIVERY'
            );

            if (activeParts.length === 0) return null;

            return (
              <VehicleGroup 
                key={vehicle.id} 
                vehicle={vehicle} 
                parts={activeParts}
              />
            );
          })
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No ongoing orders found</p>
            {searchTerm && (
              <button 
                className="text-primary text-sm mt-2 hover:underline"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 