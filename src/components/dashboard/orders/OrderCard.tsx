import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    X,
    ChevronDown,
    Car,
    Package,
    CheckCircle,
    Hourglass,
    ShoppingCart,
    Check,
    ShieldCheck,
    Wrench,
    ZoomIn,
} from "lucide-react";
// import { BidsList } from './BidsList';
import { formatDistanceToNow } from "date-fns";
import { ImagePopup } from "@/components/ImagePopup";

interface OrderCardProps {
    order: any;
    onProceedToCheckout: (orderId: string) => void;
    onBidUpdate?: () => void;
}

// BidReviewModal component with fixed image popup
const BidReviewModal = ({
    isOpen,
    onClose,
    part,
    onAcceptBid,
}: {
    isOpen: boolean;
    onClose: () => void;
    part: any | null;
    onAcceptBid: (partId: string, bidId: string) => void;
}) => {
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

    // Add early return if part is null
    if (!isOpen || !part) return null;

    const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEnlargedImage(imageUrl);
    };

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 relative z-40">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Review Bids for {part?.part_name || "Part"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(part?.bids || []).map((bid: any, index: number) => (
                            <div
                                key={bid.id}
                                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-gray-900">{`Bid ${
                                            index + 1
                                        }`}</p>
                                        <div className="flex items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Wrench className="h-4 w-4" />
                                                <span>
                                                    {bid.condition || "New"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span>
                                                    {bid.warranty || "6 Months"}{" "}
                                                    Warranty
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-4">
                                            {bid.notes && (
                                                <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 flex-grow">
                                                    <p className="font-semibold mb-2 text-gray-900">
                                                        Vendor Notes:
                                                    </p>
                                                    <p className="text-gray-600 leading-relaxed">
                                                        {bid.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {bid.image_url && (
                                                <div className="flex-shrink-0">
                                                    <p className="font-semibold mb-2 text-sm text-gray-900">
                                                        Image
                                                    </p>
                                                    <div className="relative group">
                                                        <img
                                                            src={
                                                                bid.image_url ||
                                                                "/placeholder.svg"
                                                            }
                                                            alt="Vendor bid"
                                                            className="h-20 w-20 object-cover rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                                                            onClick={(e) =>
                                                                handleImageClick(
                                                                    bid.image_url,
                                                                    e
                                                                )
                                                            }
                                                        />
                                                        <div
                                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                                                            onClick={(e) =>
                                                                handleImageClick(
                                                                    bid.image_url,
                                                                    e
                                                                )
                                                            } // Add click handler here
                                                        >
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <div className="bg-white/90 rounded-full p-1">
                                                                    <ZoomIn className="w-3 h-3 text-gray-700" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                                        <Badge
                                            variant="outline"
                                            className="text-2xl font-bold py-2 px-4 border-green-600 text-green-700 bg-green-50">
                                            AED {bid.price}
                                        </Badge>
                                        <Button
                                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            onClick={() =>
                                                onAcceptBid(part.id, bid.id)
                                            }>
                                            <Check className="mr-2 h-4 w-4" />{" "}
                                            Accept Bid & Add to Cart
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="mt-6 w-full">
                        Close
                    </Button>
                </div>
            </div>

            {enlargedImage && (
                <ImagePopup
                    imageUrl={enlargedImage}
                    onClose={() => setEnlargedImage(null)}
                    alt={`Bid image for ${part?.part_name || "Part"}`}
                />
            )}
        </>
    );
};

// First, add a helper function to check if all parts have accepted bids
const allPartsHaveAcceptedBids = (parts: any[]) => {
    return parts.every((part) => {
        const bids = part.bids || [];
        return bids.some((bid) => bid.status === "accepted");
    });
};

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onProceedToCheckout,
    onBidUpdate,
}) => {
    const { toast } = useToast();
    const [cancelling, setCancelling] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedPart, setSelectedPart] = useState<any | null>(null);

    // Calculate order metrics similar to design
    const orderMetrics = useMemo(() => {
        const parts = order.parts || [];
        const totalParts = parts.length;
        const allPartsAccepted = allPartsHaveAcceptedBids(parts);

        // Only count pending bids for parts that don't have accepted bids
        const totalPendingBids = parts.reduce((sum: number, part: any) => {
            const bids = part.bids || [];
            const hasAcceptedBid = bids.some(
                (bid: any) => bid.status === "accepted"
            );

            // If part already has an accepted bid, don't count its pending bids
            if (hasAcceptedBid) {
                return sum;
            }

            // Count pending bids only for parts without accepted bids
            const pendingBidsCount = bids.filter(
                (bid: any) => bid.status === "pending"
            ).length;
            return sum + pendingBidsCount;
        }, 0);

        const uniqueVehicles = parts.reduce((acc: any, part: any) => {
            if (part.vehicles) {
                const vehicleKey = `${part.vehicles.make}-${part.vehicles.model}-${part.vehicles.year}`;
                if (!acc[vehicleKey]) {
                    acc[vehicleKey] = part.vehicles;
                }
            }
            return acc;
        }, {});

        const vehicles = Object.values(uniqueVehicles);
        const vehicleDisplay =
            vehicles
                .map((v: any) => `${v.make} ${v.model} ${v.year}`)
                .join(", ") || "Order";

        return {
            totalParts,
            totalPendingBids,
            vehicleDisplay,
            vehicles,
            allPartsAccepted, // Add this
        };
    }, [order]);

    const handleCancelOrder = async () => {
        setCancelling(true);
        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: "cancelled" })
                .eq("id", order.id);
            if (error) throw error;
            toast({
                title: "Order cancelled",
                description: "Your order has been successfully cancelled.",
            });
            if (onBidUpdate) onBidUpdate();
        } catch (error: any) {
            toast({
                title: "Error cancelling order",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setCancelling(false);
        }
    };

    const handleAcceptBid = async (partId: string, bidId: string) => {
        try {
            const { error } = await supabase
                .from("bids")
                .update({ status: "accepted" })
                .eq("id", bidId);

            if (error) throw error;

            const { error: partError } = await supabase
                .from("parts")
                .update({
                    is_accepted: true,
                    shipping_status: "pending_pickup", // Critical update
                })
                .eq("id", partId);

            if (partError) throw partError;

            toast({
                title: "Bid accepted",
                description:
                    "The bid has been accepted and added to your cart.",
            });

            if (onBidUpdate) onBidUpdate();
            setSelectedPart(null);
        } catch (error: any) {
            toast({
                title: "Error accepting bid",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const hasPendingBids = (order.parts || []).some((part: any) =>
        (part.bids || []).some((bid: any) => bid.status === "pending")
    );

    const getOrderStatus = () => {
        if (order.status === "completed")
            return {
                label: "Completed",
                icon: CheckCircle,
                color: "bg-gray-100 text-gray-800",
            };
        if (orderMetrics.allPartsAccepted)
            // Change this condition
            return {
                label: "Ready for Checkout",
                icon: ShoppingCart,
                color: "bg-green-100 text-green-800",
            };
        if (order.totalBids > 0)
            return {
                label: "Review Bids",
                icon: Hourglass,
                color: "bg-yellow-100 text-yellow-800",
            };
        return {
            label: "New Order",
            icon: Package,
            color: "bg-blue-100 text-blue-800",
        };
    };

    const status = getOrderStatus();
    const StatusIcon = status.icon;

    const partsByVehicle = (order.parts || []).reduce((acc: any, part: any) => {
        const vehicleTitle = part.vehicles
            ? `${part.vehicles.make} ${part.vehicles.model} ${part.vehicles.year}`
            : "General Parts";
        if (!acc[vehicleTitle]) {
            acc[vehicleTitle] = [];
        }
        acc[vehicleTitle].push(part);
        return acc;
    }, {});

    const getPartBidSummary = (part: any) => {
        const bids = part.bids || [];
        const acceptedBids = bids.filter(
            (bid: any) => bid.status === "accepted"
        );
        const pendingBids = bids.filter((bid: any) => bid.status === "pending");

        if (acceptedBids.length > 0) {
            return (
                <Badge className="bg-green-100 text-green-800">
                    Bid Accepted
                </Badge>
            );
        }
        if (pendingBids.length === 0) {
            return <Badge variant="outline">No Bids Yet</Badge>;
        }

        const prices = pendingBids.map((bid: any) => bid.price).filter(Boolean);
        if (prices.length === 0) {
            return (
                <Badge className="bg-blue-100 text-blue-800">
                    {pendingBids.length} Pending Bids
                </Badge>
            );
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return (
            <Badge className="bg-blue-100 text-blue-800">
                {pendingBids.length} Pending Bids ({`AED ${min} - ${max}`})
            </Badge>
        );
    };

    // Helper function to check if a part has accepted bids
    const hasAcceptedBids = (part: any) => {
        return (part.bids || []).some((bid: any) => bid.status === "accepted");
    };

    // Helper function to check if a part has pending bids (and no accepted bids)
    const hasPendingBidsToReview = (part: any) => {
        const bids = part.bids || [];
        const hasAccepted = bids.some((bid: any) => bid.status === "accepted");
        const hasPending = bids.some((bid: any) => bid.status === "pending");

        // Only show review button if there are pending bids AND no accepted bids
        return hasPending && !hasAccepted;
    };

    return (
        <>
            <Card
                id={`order-${order.id}`}
                className="mb-4 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border scroll-mt-20">
                <CardHeader
                    className="p-4 cursor-pointer bg-gray-50/50 hover:bg-gray-100/60"
                    onClick={() => setExpanded(!expanded)}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Car className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <h3
                                    className="font-semibold text-lg truncate"
                                    title={orderMetrics.vehicleDisplay}>
                                    {orderMetrics.vehicleDisplay}
                                </h3>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                <span className="text-xs">
                                    #{order.id.slice(0, 8)}
                                </span>
                                <span className="text-xs">
                                    {formatDistanceToNow(
                                        new Date(order.created_at),
                                        { addSuffix: true }
                                    )}
                                </span>
                                <Badge variant="secondary">
                                    {orderMetrics.totalParts} Parts Requested
                                </Badge>

                                {/* Only show pending bids badge if there are actually pending bids to review */}
                                {orderMetrics.totalPendingBids > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800">
                                        {orderMetrics.totalPendingBids} Pending
                                        Bids
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                {order.hasAcceptedBids &&
                                    !order.hasAcceptedBids && (
                                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1.5 text-xs">
                                            <Hourglass className="w-3 h-3" />
                                            Review Bids
                                        </Badge>
                                    )}
                                <Badge
                                    className={`${status.color} flex items-center gap-1.5 text-xs`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                </Badge>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                                    expanded ? "rotate-180" : ""
                                }`}
                            />
                        </div>
                    </div>
                </CardHeader>

                {expanded && (
                    <CardContent className="p-4 border-t">
                        <div className="space-y-6">
                            {Object.entries(partsByVehicle).map(
                                ([vehicleTitle, parts]: [string, any[]]) => (
                                    <div key={vehicleTitle}>
                                        <h4 className="font-semibold mb-3 text-gray-800">
                                            {vehicleTitle}
                                        </h4>
                                        <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                                            {parts.map((part: any) => (
                                                <div
                                                    key={part.id}
                                                    className="p-4 rounded-lg bg-white border">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium">
                                                                {part.part_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mb-3">
                                                                Qty:{" "}
                                                                {part.quantity}
                                                            </div>
                                                            <div className="mt-2">
                                                                {getPartBidSummary(
                                                                    part
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Only show Review Bids button if part has pending bids AND no accepted bids */}
                                                        {hasPendingBidsToReview(
                                                            part
                                                        ) && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setSelectedPart(
                                                                        part
                                                                    )
                                                                }>
                                                                Review Bids
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {/* <div className="mt-3">
                          <BidsList bids={part.bids || []} onBidUpdate={onBidUpdate} />
                        </div> */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
                            {orderMetrics.allPartsAccepted && ( // Change this condition
                                <Button
                                    onClick={() =>
                                        onProceedToCheckout(order.id)
                                    }
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                    Proceed to Checkout
                                </Button>
                            )}
                            {!orderMetrics.allPartsAccepted && (
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    disabled>
                                    {hasPendingBids
                                        ? "Accept All Bids to Checkout"
                                        : "Waiting for Vendor Bids"}
                                </Button>
                            )}
                            {order.status !== "cancelled" &&
                                order.status !== "completed" && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                <X className="w-4 h-4 mr-2" />{" "}
                                                Cancel Order
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will cancel the entire
                                                    order and remove all
                                                    associated bids. This action
                                                    cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Keep Order
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleCancelOrder}
                                                    disabled={cancelling}
                                                    className="bg-red-600 hover:bg-red-700">
                                                    {cancelling
                                                        ? "Cancelling..."
                                                        : "Yes, Cancel Order"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Only render BidReviewModal if selectedPart exists */}
            {selectedPart && (
                <BidReviewModal
                    isOpen={!!selectedPart}
                    onClose={() => setSelectedPart(null)}
                    part={selectedPart}
                    onAcceptBid={handleAcceptBid}
                />
            )}
        </>
    );
};
