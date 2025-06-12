import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Briefcase, UserCheck } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { LiveOrdersTable } from './LiveOrdersTable';

export const AdminOverview: React.FC = () => {
  const { stats } = useAdminData();

  const statCards = [
    { title: 'Total Orders', value: stats?.total_orders, Icon: ShoppingCart },
    { title: 'Total Users', value: stats?.total_users, Icon: Users },
    { title: 'Total Buyers', value: stats?.total_buyers, Icon: UserCheck },
    { title: 'Total Vendors', value: stats?.total_vendors, Icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-gray-500">A high-level look at platform activity.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value ?? '-'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <LiveOrdersTable />
    </div>
  );
}; 