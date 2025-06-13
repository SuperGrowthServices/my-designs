import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { CompactStatsBar } from "./CompactStatsBar";
import { OrderBidModal } from "./OrderBidModal";
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
            let query = supabase
                .from("orders")
                .select(
                    `
          *,
          parts:parts(
            *,
            vehicle:vehicles(*),
            bids:bids(*)
          )
        `
                )
                .eq("status", "open")
                .order("created_at", { ascending: false });

            // If not an admin, only show orders where:
            // 1. No parts have accepted bids OR
            // 2. The vendor has an accepted bid on any part
            if (!isAdmin) {
                query = query.or(`
          parts.bids.status.not.eq.accepted,
          and(
            parts.bids.status.eq.accepted,
            parts.bids.vendor_id.eq.${vendorProfileId}
          )
        `);
            }

            const { data, error } = await query;

            if (error) throw error;

            const processedOrders = (data || []).map((order) => ({
                ...order,
                parts: order.parts.map((part) => ({
                    ...part,
                    existing_bid: part.bids?.find(
                        (bid) => bid.vendor_id === vendorProfileId
                    ),
                    other_bids_count:
                        part.bids?.filter(
                            (b) =>
                                b.vendor_id !== vendorProfileId &&
                                b.status === "pending"
                        ).length || 0,
                    // Add a flag to indicate if this part has any accepted bids
                    has_accepted_bid:
                        part.bids?.some((b) => b.status === "accepted") ||
                        false,
                })),
            }));

            // Filter out orders where all parts have accepted bids (unless vendor has one of them)
            const filteredOrders = processedOrders.filter((order) => {
                if (isAdmin) return true;
                return order.parts.some(
                    (part) =>
                        !part.has_accepted_bid ||
                        part.existing_bid?.status === "accepted"
                );
            });

            setOrders(filteredOrders);
        } catch (error) {
            console.error("Error fetching live orders:", error);
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
            // Assuming each order has a vehicle property that contains vehicle information
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
                            condition: 'Used - Good', // You'll need to add this to your bid type
                            warranty: '7 Days', // You'll need to add this to your bid type
                            notes: part.existing_bid.notes || '',
                            isAccepted: part.existing_bid.status === 'accepted'
                        } : undefined
                    });
                    return acc;
                }

                // Create new vehicle entry
                acc.push({
                    id: part.vehicle.id,
                    vehicleName: `${part.vehicle.year} ${part.vehicle.make} ${part.vehicle.model}`,
                    vinNumber: part.vehicle.vin ?? '', // Use nullish coalescing
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

        // Filter vehicles for each category
        const newVehicles = allVehicles.filter((v) => v.parts.some((p) => !p.myQuote));
        const quotedVehicles = allVehicles.filter(v => 
            v.parts.some(p => p.myQuote && !p.myQuote.isAccepted)
        );
        const acceptedVehicles = allVehicles.filter(v => 
            v.parts.some(p => p.myQuote?.isAccepted)
        );

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

    const displayedOrders = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();

        const filtered = orders.filter((order) => {
            // Only show orders that the vendor can bid on
            const canBidOnOrder = order.parts.some(
                (part) =>
                    !part.existing_bid && // No existing bid from this vendor
                    !part.bids?.some((b) => b.status === "accepted") // No accepted bids
            );

            if (!canBidOnOrder && !isAdmin) return false;

            const hasPendingBid = order.parts.some(
                (p) => p.existing_bid?.status === "pending"
            );
            const hasAcceptedBid = order.parts.some(
                (p) => p.existing_bid?.status === "accepted"
            );

            const matchesTab =
                (currentTab === "new" && !hasPendingBid && !hasAcceptedBid) ||
                (currentTab === "mybids" && hasPendingBid && !hasAcceptedBid) ||
                (currentTab === "accepted" && hasAcceptedBid);

            if (!matchesTab) return false;

            if (searchTerm) {
                return order.parts.some(
                    (part) =>
                        part.part_name.toLowerCase().includes(searchLower) ||
                        (part.vehicle?.make || "")
                            .toLowerCase()
                            .includes(searchLower) ||
                        (part.vehicle?.model || "")
                            .toLowerCase()
                            .includes(searchLower) ||
                        part.part_number?.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case "oldest":
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                case "vehicle":
                    const aVehicle = `${a.parts[0]?.vehicle?.make || ""} ${
                        a.parts[0]?.vehicle?.model || ""
                    }`;
                    const bVehicle = `${b.parts[0]?.vehicle?.make || ""} ${
                        b.parts[0]?.vehicle?.model || ""
                    }`;
                    return aVehicle.localeCompare(bVehicle);
                default:
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
            }
        });
    }, [orders, currentTab, searchTerm, sortOption, isAdmin]);

    const getEmptyState = () => {
        if (loading) return null;
        const titles = {
            new: {
                title: "No new orders available",
                desc: "Check back later for new orders from buyers.",
            },
            mybids: {
                title: "You haven't placed any bids yet",
                desc: "Browse new orders and place your first bid.",
            },
            accepted: {
                title: "No accepted bids yet",
                desc: "Once a buyer accepts your bid, it will appear here.",
            },
        };
        const content = titles[currentTab as keyof typeof titles];

        if (searchTerm) {
            content.title = "No orders match your search";
            content.desc = "Try adjusting your search terms.";
        }

        return (
            <div className="text-center py-16 col-span-full">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">{content.title}</h3>
                <p className="text-muted-foreground">{content.desc}</p>
            </div>
        );
    };

    const counts = useMemo(
        () => ({
            new: orders.filter((o) => !o.parts.some((p) => p.existing_bid))
                .length,
            mybids: orders.filter((o) =>
                o.parts.some((p) => p.existing_bid?.status === "pending")
            ).length,
            accepted: orders.filter((o) =>
                o.parts.some((p) => p.existing_bid?.status === "accepted")
            ).length,
        }),
        [orders]
    );

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
                            {newVehicles.map((vehicle) => (
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
                            {quotedVehicles.map((vehicle) => (
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
                            {acceptedVehicles.map((vehicle) => (
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
                />
            </div>
        </div>
    );
};
