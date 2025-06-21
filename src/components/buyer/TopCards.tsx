import { Car, Tag, ShoppingCart } from "lucide-react";

export const TopCards = () => {
    // Mock data for card counts. In a real app, this would come from an API.
    const cardData = [
        {
            title: "Live Orders",
            count: 3,
            icon: <Car className="h-5 w-5 text-primary" />,
        },
        {
            title: "Pending Bids",
            count: 5,
            icon: <Tag className="h-5 w-5 text-primary" />,
        },
        {
            title: "Ready for Checkout",
            count: 2,
            icon: <ShoppingCart className="h-5 w-5 text-primary" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cardData.map((card, index) => (
                <div key={index} className="bg-card p-4 rounded-lg border flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold">{card.count}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}; 