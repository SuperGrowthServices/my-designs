import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Search,
    Package,
    CheckCircle2,
    List,
    Clock,
    RefreshCw,
    ShoppingCart,
    CheckCircle,
    Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderWithParts, Bid } from "@/types/orders";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UpdateQuoteModal } from "./UpdateQuoteModal";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { VendorVehicle } from "@/types/vendor";

type SortOption = "newest" | "oldest" | "vehicle";

interface DisplayVehicle extends VendorVehicle {
    orderId: string;
    createdAt: string;
    status: "new" | "quoted" | "accepted";
}

const VehicleCard = ({
    vehicle,
    onSelect,
    badgeType,
}: {
    vehicle: DisplayVehicle;
    onSelect: () => void;
    badgeType: "new" | "quoted" | "accepted";
}) => {
    const partsToShow = useMemo(() => {
        switch (badgeType) {
            case "accepted":
                return vehicle.parts.filter((p) => p.myQuote?.isAccepted);
            case "quoted":
                return vehicle.parts.filter(
                    (p) => p.myQuote && !p.myQuote.isAccepted
                );
            case "new":
                return vehicle.parts.filter((p) => !p.myQuote);
            default:
                return vehicle.parts;
        }
    }, [vehicle.parts, badgeType]);

    const totalParts = partsToShow.length;
    const partNames = partsToShow.map((p) => p.partName).slice(0, 2);

    const badge = useMemo(() => {
        switch (badgeType) {
            case "new":
                return null;
            case "quoted":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Quote Sent
                    </Badge>
                );
            case "accepted":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Quote Accepted
                    </Badge>
                );
        }
    }, [badgeType]);

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden"
            onClick={onSelect}>
            <div className="p-4 bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Car className="h-6 w-6 text-slate-600" />
                        <span className="font-bold text-lg text-slate-800">
                            {vehicle.vehicleName}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(vehicle.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm pl-1 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>
                        {totalParts} Part{totalParts !== 1 ? "s" : ""}{" "}
                        {badgeType === "accepted" ? "Accepted" : "Requested"}
                    </span>
                </div>

                {badge && <div className="pl-1">{badge}</div>}

                <div className="text-sm text-muted-foreground pl-7 border-l-2 ml-3 py-1 space-y-1">
                    {partNames.map((name, index) => (
                        <p key={index} className="truncate">
                            - {name}
                        </p>
                    ))}
                    {totalParts > 2 && (
                        <p className="truncate text-xs">
                            - and {totalParts - 2} more...
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export const VendorHome: React.FC = () => {
    const { user } = useAuth();
    const { hasRole, isAdmin } = useUserRoles();
    const [orders, setOrders] = useState<OrderWithParts[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithParts | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showBidModal, setShowBidModal] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [currentTab, setCurrentTab] = useState("new");
    const [activeModal, setActiveModal] = useState<
        "details" | "update" | "view" | null
    >(null);
    const [selectedVehicle, setSelectedVehicle] =
        useState<DisplayVehicle | null>(null);


    const vendorProfileId = user?.id;

    useEffect(() => {
        if (vendorProfileId) {
            handleLoadData();
        }
    }, [vendorProfileId]);

    const handleLoadData = async () => {
        setLoading(true);
        await fetchLiveOrders();
        setLoading(false);
    };

    const fetchLiveOrders = async () => {
    if (!vendorProfileId) return;
    try {
        // First, get all open orders with their parts and bids
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                parts!inner(
                    *,
                    vehicle:vehicles(*),
                    bids(*)
                )
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Process orders...
        const processedOrders = (data || [])
            .map((order) => ({
                ...order,
                // Filter parts at the application level for more precise control
                parts: order.parts.filter(part => {
                    // CRITICAL FIX: Hide parts that have been accepted by ANY vendor
                    // This prevents other vendors from wasting time quoting on unavailable parts
                    if (part.is_accepted) {
                        // Only show accepted parts if THIS vendor's bid was the accepted one
                        return part.bids?.some(bid =>
                            bid.vendor_id === vendorProfileId &&
                            bid.status === 'accepted'
                        );
                    }

                    // NEW LOGIC: Also hide parts where someone else's bid has been accepted
                    // even if part.is_accepted isn't set yet (in case of data consistency issues)
                    const hasAcceptedBid = part.bids?.some(bid => bid.status === 'accepted');
                    if (hasAcceptedBid) {
                        // Only show if this vendor's bid was the accepted one
                        return part.bids?.some(bid =>
                            bid.vendor_id === vendorProfileId &&
                            bid.status === 'accepted'
                        );
                    }

                    // Show all other parts (new parts or parts with pending bids)
                    return true;
                })
                .map((part) => ({
                    ...part,
                    existing_bid: part.bids?.find(
                        (bid) => bid.vendor_id === vendorProfileId
                    ),
                    other_bids_count:
                        part.bids?.filter(
                            (b) =>
                                b.vendor_id !== vendorProfileId &&
                                b.status === 'pending'
                        ).length || 0,
                }))
            }))
            // Remove orders that have no visible parts after filtering
            .filter(order => order.parts.length > 0);

        setOrders(processedOrders);
    } catch (error) {
        console.error('Error fetching live orders:', error);
    }
};

    const handleRefresh = () => {
        if (!refreshing) {
            setRefreshing(true);
            handleLoadData().finally(() => setRefreshing(false));
        }
    };

    const handleBidUpdate = () => {
        handleLoadData();
    };

    const handleOrderSelect = (order: OrderWithParts) => {
        setSelectedOrder(order);
        setShowBidModal(true);
    };

    // Add or modify the useMemo for processing vehicles
    const { newVehicles, quotedVehicles, acceptedVehicles } = useMemo(() => {
    const allVehicles: DisplayVehicle[] = (orders as OrderWithParts[]).flatMap((order) =>
        order.parts.reduce((acc: DisplayVehicle[], part) => {
            if (!part.vehicle) return acc;

            // Find existing vehicle in accumulator
            const existingVehicle = acc.find((v) => v.id === part.vehicle.id);

            if (existingVehicle) {
                // Add part to existing vehicle
                existingVehicle.parts.push({
                    id: part.id,
                    partName: part.part_name,
                    partNumber: part.part_number || '',
                    quantity: part.quantity,
                    myQuote: part.existing_bid ? {
                        id: part.existing_bid.id,
                        price: part.existing_bid.price,
                        condition: 'Used - Good',
                        warranty: '7 Days',
                        notes: part.existing_bid.notes || '',
                        imageUrl: part.existing_bid.image_url,
                        isAccepted: part.existing_bid.status === 'accepted'
                    } : undefined
                });
                return acc;
            }

            // Create new vehicle entry
            acc.push({
                id: part.vehicle.id,
                vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
                vinNumber: part.vehicle.vin ?? '',
                orderId: order.id,
                createdAt: order.created_at,
                parts: [{
                    id: part.id,
                    partName: part.part_name,
                    partNumber: part.part_number || '',
                    quantity: part.quantity,
                    myQuote: part.existing_bid ? {
                        id: part.existing_bid.id,
                        price: part.existing_bid.price,
                        condition: 'Used - Good',
                        warranty: '7 Days',
                        notes: part.existing_bid.notes || '',
                        imageUrl: part.existing_bid.image_url,
                        isAccepted: part.existing_bid.status === 'accepted'
                    } : undefined
                }],
                status: part.existing_bid ?
                    (part.existing_bid.status === 'accepted' ? 'accepted' : 'quoted')
                    : 'new'
            });
            return acc;
        }, [])
    );

    // Create separate vehicle instances for different categories
    // This allows the same vehicle to appear in multiple tabs with different parts
    
    // New Requests: Show vehicles with parts that have no quotes yet
    const newVehicles = allVehicles
        .map(vehicle => ({
            ...vehicle,
            parts: vehicle.parts.filter(p => !p.myQuote)
        }))
        .filter(vehicle => vehicle.parts.length > 0);

    // My Quotes: Show vehicles with parts that are quoted but NOT accepted
    const quotedVehicles = allVehicles
        .map(vehicle => ({
            ...vehicle,
            parts: vehicle.parts.filter(p => p.myQuote && !p.myQuote.isAccepted)
        }))
        .filter(vehicle => vehicle.parts.length > 0);

    // Accepted Quotes: Show vehicles with parts that ARE accepted
    const acceptedVehicles = allVehicles
        .map(vehicle => ({
            ...vehicle,
            parts: vehicle.parts.filter(p => p.myQuote?.isAccepted)
        }))
        .filter(vehicle => vehicle.parts.length > 0);

    return { newVehicles, quotedVehicles, acceptedVehicles };
}, [orders]);

    // Update the stats calculation
    const summaryStats = useMemo(() => ({
        openOrders: newVehicles.length,
        quotesPlaced: quotedVehicles.length,
        accepted: acceptedVehicles.length
    }), [newVehicles, quotedVehicles, acceptedVehicles]);

    // Add the handleSelectVehicle function
    const handleSelectVehicle = (vehicle: DisplayVehicle, modalType: 'details' | 'update' | 'view') => {
        setSelectedVehicle(vehicle);
        setActiveModal(modalType);
    };

    const handleCloseModals = () => {
        setSelectedVehicle(null);
        setActiveModal(null);
    };
    const handleRefreshData = () => {
        handleLoadData();
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
                                    <p className="text-sm font-medium text-blue-100">
                                        Open Requests
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {summaryStats.openOrders}
                                    </p>
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
                                    <p className="text-sm font-medium text-amber-100">
                                        Quotes Placed
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {summaryStats.quotesPlaced}
                                    </p>
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
                                    <p className="text-sm font-medium text-green-100">
                                        Accepted
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {summaryStats.accepted}
                                    </p>
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
                            <Input
                                placeholder="Search by part, vehicle, or part number..."
                                className="pl-10 focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Tabs defaultValue="new-orders" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1 rounded-lg">
                        <TabsTrigger
                            value="new-orders"
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">
                            New Requests ({newVehicles.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-quotes"
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">
                            My Quotes ({quotedVehicles.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="accepted-quotes"
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-md">
                            Accepted Quotes ({acceptedVehicles.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="new-orders" className="mt-6">
                        <div className="space-y-4">
                            {newVehicles
                                .filter(vehicle => {
                                    if (!searchTerm) return true;
                                    const searchLower = searchTerm.toLowerCase();
                                    return (
                                        vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                                        vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                                        vehicle.parts.some(part =>
                                            part.partName.toLowerCase().includes(searchLower) ||
                                            part.partNumber.toLowerCase().includes(searchLower)
                                        )
                                    );
                                })
                                .map((vehicle) => (
                                    <VehicleCard
                                        key={`new-${vehicle.id}`}
                                        vehicle={vehicle}
                                        onSelect={() =>
                                            handleSelectVehicle(vehicle, "details")
                                        }
                                        badgeType="new"
                                    />
                                ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="my-quotes" className="mt-6">
                        <div className="space-y-4">
                            {quotedVehicles
                                .filter(vehicle => {
                                    if (!searchTerm) return true;
                                    const searchLower = searchTerm.toLowerCase();
                                    return (
                                        vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                                        vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                                        vehicle.parts.some(part =>
                                            part.partName.toLowerCase().includes(searchLower) ||
                                            part.partNumber.toLowerCase().includes(searchLower)
                                        )
                                    );
                                })
                                .map((vehicle) => (
                                    <VehicleCard
                                        key={`myquote-${vehicle.id}`}
                                        vehicle={vehicle}
                                        onSelect={() =>
                                            handleSelectVehicle(vehicle, "update")
                                        }
                                        badgeType="quoted"
                                    />
                                ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="accepted-quotes" className="mt-6">
                        <div className="space-y-4">
                            {acceptedVehicles
                                .filter(vehicle => {
                                    if (!searchTerm) return true;
                                    const searchLower = searchTerm.toLowerCase();
                                    return (
                                        vehicle.vehicleName.toLowerCase().includes(searchLower) ||
                                        vehicle.vinNumber.toLowerCase().includes(searchLower) ||
                                        vehicle.parts.some(part =>
                                            part.partName.toLowerCase().includes(searchLower) ||
                                            part.partNumber.toLowerCase().includes(searchLower)
                                        )
                                    );
                                })
                                .map((vehicle) => (
                                    <VehicleCard
                                        key={`accepted-${vehicle.id}`}
                                        vehicle={vehicle}
                                        onSelect={() =>
                                            handleSelectVehicle(vehicle, "view")
                                        }
                                        badgeType="accepted"
                                    />
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>
                <OrderDetailsModal
                    order={activeModal === 'details' ? {
                        id: selectedVehicle?.orderId || '',
                        orderId: selectedVehicle?.orderId || '',
                        createdAt: selectedVehicle?.createdAt || '',
                        vehicles: selectedVehicle ? [selectedVehicle] : []
                    } : null}
                    onClose={handleCloseModals}
                    onAddQuote={handleBidUpdate}
                    onRefreshData={handleRefreshData}
                />
                <UpdateQuoteModal
                    order={activeModal === 'update' || activeModal === 'view' ? {
                        id: selectedVehicle?.orderId || '',
                        orderId: selectedVehicle?.orderId || '',
                        createdAt: selectedVehicle?.createdAt || '',
                        vehicles: selectedVehicle ? [selectedVehicle] : []
                    } : null}
                    onClose={handleCloseModals}
                    mode={activeModal === 'view' ? 'view' : 'update'}
                    onUpdate={handleBidUpdate}
                />
            </div>
        </div>
    );
};
