import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LogisticsTable } from '@/components/logistics/LogisticsTable';
import { Package, Truck, MapPin } from 'lucide-react';

export const DriverDashboard = () => {
  return (
    <div className="space-y-6">

        
      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>My Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <LogisticsTable />
        </CardContent>
      </Card>
    </div>
  );
};