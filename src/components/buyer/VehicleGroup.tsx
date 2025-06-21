import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PartModal } from "./PartModal";
import { Part, Vehicle, GroupStatus, getGroupStatus, mockVehicles } from "@/data/buyerDashboardMockData";

interface VehicleGroupProps {
  vehicle: Vehicle;
  parts: Part[];
}

export const VehicleGroup = ({ vehicle, parts }: VehicleGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const groupStatus: GroupStatus = getGroupStatus(parts);
  const orderId = parts[0]?.orderId || "N/A";
  const orderDate = parts[0]?.orderDate
    ? new Date(parts[0].orderDate).toLocaleDateString()
    : "N/A";

  const getGroupStatusBadge = (status: GroupStatus) => {
    switch (status) {
      case "NEW":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">New</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>;
      case "COMPLETE":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Complete</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {vehicle.make} {vehicle.year}
                </h3>
                {getGroupStatusBadge(groupStatus)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Order #{orderId} • {orderDate} • {parts.length} part{parts.length !== 1 ? "s" : ""}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            {parts.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between py-3 px-2 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedPart(part)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{part.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={part.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {selectedPart && (
        <PartModal
          part={selectedPart}
          vehicles={mockVehicles}
          onOpenChange={setSelectedPart}
        />
      )}
    </div>
  );
}; 