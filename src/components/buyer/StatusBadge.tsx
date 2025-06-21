import { Badge } from "@/components/ui/badge";
import { PartStatus } from "@/data/buyerDashboardMockData";

interface StatusBadgeProps {
  status: PartStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: PartStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          variant: "outline" as const,
          icon: "🔹",
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          variant: "secondary" as const,
          icon: "✅",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          variant: "default" as const,
          icon: "🚚",
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          variant: "secondary" as const,
          icon: "✔️",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: "❌",
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          variant: "warning" as const,
          icon: "💸",
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: "❓",
        };
    }
  };

  const { label, variant, icon } = getStatusConfig(status);

  return (
    <Badge variant={variant} className="text-xs font-medium">
      {icon} {label}
    </Badge>
  );
}; 