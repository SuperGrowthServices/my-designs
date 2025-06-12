
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResponsiveTable } from '@/components/layout/ResponsiveTable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Download, Search, Filter, Receipt, MessageCircle, Package, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderHistoryItem {
  id: string;
  created_at: string;
  status: string;
  parts_count: number;
  total_amount: number;
  payment_status: string;
  paid_at: string | null;
  invoice_url: string | null;
  parts: Array<{
    part_name: string;
    quantity: number;
    vehicle?: {
      make: string;
      model: string;
      year: number;
    };
  }>;
}

export const QuoteHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    completedOrders: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user) {
      fetchOrderHistory();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo, sortBy]);

  const fetchOrderHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          parts (
            *,
            vehicles (make, model, year)
          ),
          invoices (
            id,
            total_amount,
            payment_status,
            paid_at,
            invoice_url
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled', 'refunded'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching order history:', error);
        return;
      }

      const transformedOrders: OrderHistoryItem[] = (data || []).map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        parts_count: order.parts?.length || 0,
        total_amount: order.invoices?.[0]?.total_amount || 0,
        payment_status: order.invoices?.[0]?.payment_status || 'unpaid',
        paid_at: order.invoices?.[0]?.paid_at || null,
        invoice_url: order.invoices?.[0]?.invoice_url || null,
        parts: (order.parts || []).map((part: any) => ({
          part_name: part.part_name,
          quantity: part.quantity,
          vehicle: part.vehicles ? {
            make: part.vehicles.make,
            model: part.vehicles.model,
            year: part.vehicles.year
          } : undefined
        }))
      }));

      setOrders(transformedOrders);

      // Calculate stats
      const totalSpent = transformedOrders.reduce((sum, order) => 
        sum + (order.status === 'completed' ? order.total_amount : 0), 0
      );
      const completedCount = transformedOrders.filter(order => order.status === 'completed').length;
      
      setStats({
        totalOrders: transformedOrders.length,
        totalSpent,
        avgOrderValue: completedCount > 0 ? totalSpent / completedCount : 0,
        completedOrders: completedCount
      });

    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.parts.some(part => 
          part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= dateFrom
      );
    }
    if (dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= dateTo
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.total_amount - b.total_amount);
        break;
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortBy('newest');
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Status', 'Parts', 'Total Amount (AED)', 'Payment Status'];
    const csvData = filteredOrders.map(order => [
      order.id.slice(0, 8),
      format(new Date(order.created_at), 'yyyy-MM-dd'),
      order.status,
      order.parts_count,
      order.total_amount.toFixed(2),
      order.payment_status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewReceipt = (orderId: string) => {
    navigate(`/receipt/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      cancelled: 'destructive',
      refunded: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (value: string) => (
        <div className="font-mono text-sm">#{value.slice(0, 8)}</div>
      ),
      mobileLabel: 'Order'
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => (
        <div className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'parts_count',
      label: 'Items',
      render: (value: number) => (
        <Badge variant="outline">{value} part{value !== 1 ? 's' : ''}</Badge>
      ),
      mobileLabel: 'Parts'
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (value: number) => (
        <div className="font-semibold text-green-600">
          AED {value.toFixed(2)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: OrderHistoryItem) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewReceipt(row.id)}
          >
            <Receipt className="w-4 h-4 mr-1" />
            Receipt
          </Button>
          {row.invoice_url && (
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <a href={row.invoice_url} target="_blank" rel="noopener noreferrer">
                <Package className="w-4 h-4 mr-1" />
                Invoice
              </a>
            </Button>
          )}
        </div>
      ),
      hideOnMobile: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View and manage your completed orders</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">AED {stats.totalSpent.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">AED {stats.avgOrderValue.toFixed(0)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completedOrders}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Order ID, part name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
        {(searchTerm || statusFilter !== 'all' || dateFrom || dateTo) && (
          <Badge variant="secondary">Filters Applied</Badge>
        )}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <ResponsiveTable
            columns={columns}
            data={filteredOrders}
            emptyMessage="No orders found matching your criteria"
          />
        </CardContent>
      </Card>
    </div>
  );
};
