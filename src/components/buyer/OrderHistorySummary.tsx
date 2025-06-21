import { Card, CardContent } from "@/components/ui/card";
import { Archive, Clock, RefreshCw, CheckCircle } from "lucide-react";

const summaryData = [
    { title: "Total Orders", value: "26", icon: Archive, color: "text-blue-500", bgColor: "bg-blue-50" },
    { title: "Awaiting Action", value: "9", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-50" },
    { title: "In Progress", value: "3", icon: RefreshCw, color: "text-purple-500", bgColor: "bg-purple-50" },
    { title: "Completed", value: "10", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-50" }
];

export const OrderHistorySummary = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryData.map((item, index) => (
                <Card key={index}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{item.title}</p>
                            <p className="text-3xl font-bold">{item.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${item.bgColor}`}>
                            <item.icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}; 