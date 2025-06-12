import React, { useState, useMemo } from 'react';
import { VendorOrder, VendorVehicle, VendorPart } from '@/data/mockVendorData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, List, CheckCircle, Car } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrderDetailsModal_Design, UpdateQuoteModal_Design } from './VendorModals';
import { Badge } from '@/components/ui/badge';

// This is the new, flattened data structure for rendering cards
interface DisplayVehicle extends VendorVehicle {
    orderId: string;
    createdAt: string;
    status: 'new' | 'quoted' | 'accepted';
}

const VehicleCard = ({ vehicle, onSelect, badgeType }: { vehicle: DisplayVehicle, onSelect: () => void, badgeType: 'new' | 'quoted' | 'accepted' }) => {
    
    const partsToShow = useMemo(() => {
        switch (badgeType) {
            case 'accepted':
                return vehicle.parts.filter(p => p.myQuote?.isAccepted);
            case 'quoted':
                return vehicle.parts.filter(p => p.myQuote && !p.myQuote.isAccepted);
            case 'new':
                 return vehicle.parts.filter(p => !p.myQuote);
            default:
                return vehicle.parts;
        }
    }, [vehicle.parts, badgeType]);

    const totalParts = partsToShow.length;
    const partNames = partsToShow.map(p => p.partName).slice(0, 2);
    
    const badge = useMemo(() => {
        switch (badgeType) {
            case 'new':
                return null;
            case 'quoted':
                 return <Badge className="bg-blue-100 text-blue-800">Quote Sent</Badge>;
            case 'accepted':
                 return <Badge className="bg-green-100 text-green-800">Quote Accepted</Badge>;
        }
    }, [badgeType]);
    
    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden" onClick={onSelect}>
            <div className="p-4 bg-slate-50 border-b">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Car className="h-6 w-6 text-slate-600" />
                        <span className="font-bold text-lg text-slate-800">{vehicle.vehicleName}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex-shrink-0 ml-2">{formatDistanceToNow(new Date(vehicle.createdAt), { addSuffix: true })}</p>
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm pl-1 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{totalParts} Part{totalParts !== 1 ? 's' : ''} {badgeType === 'accepted' ? 'Accepted' : 'Requested'}</span>
                </div>
                
                {badge && (
                    <div className="pl-1">
                       {badge}
                    </div>
                )}

                <div className="text-sm text-muted-foreground pl-7 border-l-2 ml-3 py-1 space-y-1">
                   {partNames.map((name, index) => <p key={index} className="truncate">- {name}</p>)}
                   {totalParts > 2 && <p className="truncate text-xs">- and {totalParts - 2} more...</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export const VendorHome_Design = ({ orders, onAddQuote }) => {
    const [activeModal, setActiveModal] = useState<'details' | 'update' | 'view' | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<DisplayVehicle | null>(null);

    const { newVehicles, quotedVehicles, acceptedVehicles } = useMemo(() => {
        const allVehicles: DisplayVehicle[] = orders.flatMap(order =>
            order.vehicles.map(vehicle => {
                const hasAcceptedQuote = vehicle.parts.some(p => p.myQuote?.isAccepted);
                const hasPendingQuote = vehicle.parts.some(p => p.myQuote && !p.myQuote.isAccepted);
                
                let status: DisplayVehicle['status'] = 'new';
                if(hasAcceptedQuote) status = 'accepted';
                else if (hasPendingQuote) status = 'quoted';
                
                return {
                    ...vehicle,
                    orderId: order.orderId,
                    createdAt: order.createdAt,
                    status: status,
                }
            })
        );
        
        // A vehicle can appear in multiple tabs if it has mixed part statuses
        const newVehicles = allVehicles.filter(v => v.parts.some(p => !p.myQuote));
        const quotedVehicles = allVehicles.filter(v => v.parts.some(p => p.myQuote) && !v.parts.some(p => p.myQuote?.isAccepted));
        const acceptedVehicles = allVehicles.filter(v => v.parts.some(p => p.myQuote?.isAccepted));

        return { newVehicles, quotedVehicles, acceptedVehicles };
    }, [orders]);

    const handleSelectVehicle = (vehicle: DisplayVehicle, modalType: 'details' | 'update' | 'view') => {
        setSelectedVehicle(vehicle);
        setActiveModal(modalType);
    };

    const handleCloseModals = () => {
      
        setActiveModal(null);
    };
    
    const getModalTypeForVehicle = (vehicle: DisplayVehicle): 'details' | 'update' | 'view' => {
        switch(vehicle.status) {
            case 'accepted': return 'view';
            case 'quoted': return 'update';
            case 'new': return 'details';
            default: return 'details';
        }
    }

    const summaryStats = {
        openOrders: newVehicles.length,
        quotesPlaced: quotedVehicles.length,
        accepted: acceptedVehicles.length
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="grid gap-6 md:grid-cols-3 md:gap-8 mb-8">
                    {/* Open Requests Card */}
                    <Card className="bg-blue-500 text-white shadow-lg border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-100">Open Requests</p>
                                    <p className="text-3xl font-bold">{summaryStats.openOrders}</p>
                                </div>
                                <div className="p-3 bg-blue-600 rounded-full">
                                    <Package className="h-7 w-7 text-blue-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Quotes Placed Card */}
                    <Card className="bg-amber-500 text-white shadow-lg border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-100">Quotes Placed</p>
                                    <p className="text-3xl font-bold">{summaryStats.quotesPlaced}</p>
                                </div>
                                 <div className="p-3 bg-amber-600 rounded-full">
                                    <List className="h-7 w-7 text-amber-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Accepted Quotes Card */}
                    <Card className="bg-green-500 text-white shadow-lg border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-100">Accepted</p>
                                    <p className="text-3xl font-bold">{summaryStats.accepted}</p>
                                </div>
                                <div className="p-3 bg-green-600 rounded-full">
                                    <CheckCircle className="h-7 w-7 text-green-100" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input placeholder="Search by part, vehicle, or part number..." className="pl-10 focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Tabs defaultValue="new-orders" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1 rounded-lg">
                        <TabsTrigger value="new-orders" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">New Requests ({newVehicles.length})</TabsTrigger>
                        <TabsTrigger value="my-quotes" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">My Quotes ({quotedVehicles.length})</TabsTrigger>
                        <TabsTrigger value="accepted-quotes" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">Accepted Quotes ({acceptedVehicles.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="new-orders" className="mt-6">
                        <div className="space-y-4">
                            {newVehicles.map(vehicle => <VehicleCard key={`new-${vehicle.id}`} vehicle={vehicle} onSelect={() => handleSelectVehicle(vehicle, 'details')} badgeType="new" />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="my-quotes" className="mt-6">
                        <div className="space-y-4">
                            {quotedVehicles.map(vehicle => <VehicleCard key={`myquote-${vehicle.id}`} vehicle={vehicle} onSelect={() => handleSelectVehicle(vehicle, 'update')} badgeType="quoted" />)}
                        </div>
                    </TabsContent>
                    <TabsContent value="accepted-quotes" className="mt-6">
                        <div className="space-y-4">
                            {acceptedVehicles.map(vehicle => <VehicleCard key={`accepted-${vehicle.id}`} vehicle={vehicle} onSelect={() => handleSelectVehicle(vehicle, 'view')} badgeType="accepted" />)}
                        </div>
                    </TabsContent>
                </Tabs>
                <OrderDetailsModal_Design order={activeModal === 'details' ? { id: selectedVehicle?.orderId, orderId: selectedVehicle?.orderId, createdAt: selectedVehicle?.createdAt, vehicles: [selectedVehicle] } : null} onClose={handleCloseModals} onAddQuote={onAddQuote} />
                <UpdateQuoteModal_Design order={activeModal === 'update' || activeModal === 'view' ? { id: selectedVehicle?.orderId, orderId: selectedVehicle?.orderId, createdAt: selectedVehicle?.createdAt, vehicles: [selectedVehicle] } : null} onClose={handleCloseModals} mode={activeModal === 'view' ? 'view' : 'update'} />
            </div>
        </div>
    );
} 