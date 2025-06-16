
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

interface EarningsData {
  id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  bid_price: number;
  vendor_earning: number;
  shipped_at: string;
  order_id: string;
  vehicle: string;
}

interface MonthlyEarnings {
  month: string;
  earnings: number;
  cumulative: number;
}

export const Earnings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyEarnings[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarningsData();
    }
  }, [user]);

  const getCurrentPayoutPeriod = () => {
    const now = new Date();
    const day = now.getDate();
    
    if (day <= 15) {
      // Current period: 1st to 15th
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59);
      return { start: periodStart, end: periodEnd };
    } else {
      // Current period: 16th to end of month
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 16);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start: periodStart, end: periodEnd };
    }
  };

  const fetchEarningsData = async () => {
    if (!user) return;

    try {

      // Get all shipped bids with earnings (90% of bid price)
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          price,
          shipped_at,
          parts (
            id,
            part_name,
            part_number,
            quantity,
            order_id,
            vehicle:vehicles (
              make,
              model,
              year
            )
          )
        `)
        .eq('vendor_id', user.id)
        .eq('status', 'accepted')
        .not('shipped_at', 'is', null)
        .order('shipped_at', { ascending: false });

      if (bidsError) throw bidsError;

      // Process earnings data
      const earningsData: EarningsData[] = [];
      const monthlyEarningsMap = new Map<string, number>();

      if (bidsData) {
        for (const bid of bidsData) {
          if (bid.parts && bid.shipped_at) {
            const vendorEarning = Number(bid.price) * 0.9; // 90% of bid price
            const shippedDate = new Date(bid.shipped_at);
            const monthKey = `${shippedDate.getFullYear()}-${String(shippedDate.getMonth() + 1).padStart(2, '0')}`;

            earningsData.push({
              id: bid.id,
              part_name: bid.parts.part_name,
              part_number: bid.parts.part_number || 'N/A',
              quantity: bid.parts.quantity,
              bid_price: Number(bid.price),
              vendor_earning: vendorEarning,
              shipped_at: bid.shipped_at,
              order_id: bid.parts.order_id,
              vehicle: `${bid.parts.vehicle.make} ${bid.parts.vehicle.model} ${bid.parts.vehicle.year}`
            });

            // Accumulate monthly earnings
            const currentEarnings = monthlyEarningsMap.get(monthKey) || 0;
            monthlyEarningsMap.set(monthKey, currentEarnings + vendorEarning);
          }
        }
      }

      setEarnings(earningsData);

      // Calculate stats
      const totalEarnings = earningsData.reduce((sum, item) => sum + item.vendor_earning, 0);
      
      // This month earnings (from 1st to now)
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEarnings = earningsData
        .filter(item => new Date(item.shipped_at) >= firstOfMonth)
        .reduce((sum, item) => sum + item.vendor_earning, 0);

      // Calculate pending earnings based on current payout period
      const currentPeriod = getCurrentPayoutPeriod();
      const pendingEarnings = earningsData
        .filter(item => {
          const shippedDate = new Date(item.shipped_at);
          return shippedDate >= currentPeriod.start && shippedDate <= currentPeriod.end;
        })
        .reduce((sum, item) => sum + item.vendor_earning, 0);

      setStats({
        totalEarnings,
        thisMonthEarnings,
        pendingEarnings
      });

      // Prepare monthly chart data
      const sortedMonths = Array.from(monthlyEarningsMap.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      let cumulativeEarnings = 0;
      const monthlyChartData: MonthlyEarnings[] = sortedMonths.map(([month, earnings]) => {
        cumulativeEarnings += earnings;
        return {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          earnings,
          cumulative: cumulativeEarnings
        };
      });

      setMonthlyData(monthlyChartData);

    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast({
        title: "Error loading earnings",
        description: "Unable to fetch earnings data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Earnings (AED)',
      value: stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'This Month (AED)',
      value: stats.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Payment (AED)',
      value: stats.pendingEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-600">Track your earnings from completed and shipped orders. Payouts occur on the 1st and 15th of each month.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cumulative Earnings Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `AED ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    name === 'cumulative' ? 'Cumulative Earnings' : 'Monthly Earnings'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No earnings data available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : earnings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No earnings recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Details</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="text-right">Bid Price</TableHead>
                  <TableHead className="text-right">Your Earning (90%)</TableHead>
                  <TableHead>Shipped Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{earning.part_name}</div>
                        <div className="text-sm text-gray-600">
                          Part #: {earning.part_number} • Qty: {earning.quantity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{earning.vehicle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500 font-mono">
                        #{earning.order_id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      AED {earning.bid_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      AED {earning.vendor_earning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {new Date(earning.shipped_at).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payout Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Payment Schedule:</strong> Payouts are processed twice monthly - on the 1st and 15th of each month.
              Items shipped between 1st-15th are paid on 15th. Items shipped between 16th-end of month are paid on 1st of next month.
              You receive 90% of the accepted bid amount once the item has been marked as shipped.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
