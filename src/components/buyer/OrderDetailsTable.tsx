import { mockParts, mockVehicles, Part, Vehicle } from "@/data/buyerDashboardMockData";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrderDetailsTableProps {
    orderId: string;
    onViewDetails: (partId: string) => void;
}

// Helper to group parts by vehicle
const groupPartsByVehicle = (parts: Part[]) => {
    return parts.reduce((acc, part) => {
        const key = part.vehicleId;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(part);
        return acc;
    }, {} as Record<string, Part[]>);
};

export const OrderDetailsTable = ({ orderId, onViewDetails }: OrderDetailsTableProps) => {
    const parts = mockParts.filter(p => p.orderId === orderId && (p.status === 'DELIVERED' || p.status === 'REFUNDED'));
    if (parts.length === 0) return <div className="p-4 bg-gray-50 text-center text-sm">No delivered parts found for this order.</div>;

    const groupedParts = groupPartsByVehicle(parts);
    const vehicleIds = Object.keys(groupedParts);

    const subtotal = parts
        .filter(p => p.status !== 'REFUNDED')
        .reduce((sum, part) => sum + (part.price || 0) * part.quantity, 0);
    const deliveryFee = 50; // Standard delivery fee
    const grandTotal = subtotal + deliveryFee;

    const formatCurrency = (amount: number) => `AED ${amount.toFixed(2)}`;

    return (
        <div className="bg-gray-50/50 p-4 md:p-6 border-t">
            {vehicleIds.map(vehicleId => {
                const vehicle = mockVehicles.find(v => v.id === vehicleId);
                const vehicleParts = groupedParts[vehicleId];
                return (
                    <div key={vehicleId} className="mb-6 last:mb-0">
                        {vehicle && (
                             <h4 className="text-md font-semibold mb-2 text-gray-800">
                                {vehicle.make} {vehicle.model} ({vehicle.year}) - <span className="font-normal text-gray-600">{vehicle.vin}</span>
                            </h4>
                        )}
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-2/5">Part Name</TableHead>
                                        <TableHead>Part Number</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleParts.map(part => {
                                        const isRefunded = part.status === 'REFUNDED';
                                        return (
                                        <TableRow key={part.id} className={isRefunded ? 'bg-gray-100' : ''}>
                                            <TableCell className="font-medium">{part.name}</TableCell>
                                            <TableCell>{part.partNumber}</TableCell>
                                            <TableCell>{part.quantity}</TableCell>
                                            <TableCell>
                                                 {isRefunded ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="line-through text-muted-foreground cursor-help">
                                                                    {formatCurrency(part.price || 0)}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Refunded – Not charged</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    formatCurrency(part.price || 0)
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isRefunded ? (
                                                    <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">💸 Refunded</Badge>
                                                ) : (
                                                    <Button variant="link" className="h-auto p-0" onClick={() => onViewDetails(part.id)}>View Details</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                );
            })}
            
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-lg font-bold">Grand Total</span>
                        <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}; 