import React, { useMemo, useState } from 'react';
import { mockDeliveryOrders, DeliveryOrder, DeliveryPart } from '@/data/deliveryMockData';
import DeliveringMapView from '@/components/delivery/DeliveringMapView';
import { EnrichedDeliveryPart, GroupedByAddress } from './Delivering';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DeliveringMapPage: React.FC = () => {
    const [orders] = useState<DeliveryOrder[]>(mockDeliveryOrders);
    const partsByAddress = useMemo((): GroupedByAddress[] => {
        const allParts: EnrichedDeliveryPart[] = orders.flatMap(order => 
            order.vehicles.flatMap(vehicle => 
                vehicle.parts
                .filter(part => part.status === 'Out for Delivery')
                .map(part => ({ ...part, orderId: order.id, vehicleName: vehicle.vehicleName }))
            )
        );
        const grouped = allParts.reduce((acc, part) => {
            const order = orders.find(o => o.id === part.orderId);
            if (!order) return acc;
            if (!acc[order.deliveryAddress]) {
                acc[order.deliveryAddress] = {
                    address: order.deliveryAddress,
                    buyerName: order.buyerName,
                    phone: order.phone,
                    lat: part.vendorLat,
                    lng: part.vendorLng,
                    parts: [],
                };
            }
            acc[order.deliveryAddress].parts.push(part);
            return acc;
        }, {} as Record<string, GroupedByAddress>);
        return Object.values(grouped);
    }, [orders]);

    return (
        <div className="h-screen w-full">
            <div className="flex justify-between items-center p-6 pb-0">
                <h1 className="text-2xl font-bold">Delivering Locations Map</h1>
                <Button asChild variant="outline">
                    <Link to="/delivery/delivering">List View</Link>
                </Button>
            </div>
            <DeliveringMapView data={partsByAddress} />
        </div>
    );
};

export default DeliveringMapPage; 