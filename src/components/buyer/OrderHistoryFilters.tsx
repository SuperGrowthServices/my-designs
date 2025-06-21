import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Filter } from "lucide-react";

interface OrderHistoryFiltersProps {
    onClearFilters: () => void;
}

export const OrderHistoryFilters = ({ onClearFilters }: OrderHistoryFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5"/>
            Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <Input placeholder="Order ID, part name" className="pl-9"/>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                 <Input type="date" />
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <Input type="date" />
            </div>
            <div>
                 <Button variant="outline" className="w-full" onClick={onClearFilters}>Clear Filters</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}; 