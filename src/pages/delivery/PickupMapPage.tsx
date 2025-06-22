import React, { useMemo } from 'react';
import { mockDeliveryOrders, DeliveryOrder, DeliveryPart } from '@/data/deliveryMockData';
import PickupMapView from '@/components/delivery/PickupMapView';
import { GroupedByVendor, EnrichedPart } from './Pickup';
import { Link } from 'react-router-dom';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PickupMapPage: React.FC = () => {
    // NOTE: In a real app, this data would be fetched or passed via state management.
    // For now, we re-calculate it here just like in the Pickup page.
    const partsByVendor = useMemo((): GroupedByVendor[] => {
        const allParts: EnrichedPart[] = mockDeliveryOrders.flatMap(order => 
            order.vehicles.flatMap(vehicle => 
                vehicle.parts
                .filter(part => part.status === 'Accepted')
                .map(part => ({ ...part, orderId: order.id, vehicleName: vehicle.vehicleName }))
            )
        );

        const grouped = allParts.reduce((acc, part) => {
            if (!acc[part.vendorId]) {
                acc[part.vendorId] = {
                    vendor: {
                        id: part.vendorId,
                        name: part.vendorName,
                        address: part.vendorAddress,
                        phone: part.vendorPhone,
                        lat: part.vendorLat,
                        lng: part.vendorLng,
                    },
                    parts: [],
                };
            }
            acc[part.vendorId].parts.push(part);
            return acc;
        }, {} as Record<string, GroupedByVendor>);

        return Object.values(grouped);
    }, []);

    return (
        <div className="flex flex-col h-screen">
             <header className="p-4 border-b flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold">Pickup Locations Map</h1>
                <Button asChild variant="outline">
                    <Link to="/delivery/pickup">
                        <List className="mr-2 h-4 w-4" />
                        List View
                    </Link>
                </Button>
            </header>
            <main className="flex-grow">
                {partsByVendor.length > 0 ? (
                    <PickupMapView data={partsByVendor} />
                ) : (
                    <div className="p-4">No parts ready for pickup.</div>
                )}
            </main>
        </div>
    );
};

export default PickupMapPage; 