import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import DashboardTab from '@/components/admin/new_design/DashboardTab';
import BuyersTab from '@/components/admin/new_design/BuyersTab';
import VendorsTab from '@/components/admin/new_design/VendorsTab';
import SourcersTab from '@/components/admin/new_design/SourcersTab';
import QuoteActivityTab from '@/components/admin/new_design/QuoteActivityTab';
import InvoicesTab from '@/components/admin/new_design/InvoicesTab';
import ReportsTab from '@/components/admin/new_design/ReportsTab';
import SettingsTab from '@/components/admin/new_design/SettingsTab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import RefundModal from '@/pages/NewDashboard/components/RefundModal';
import { ReceiptHeader } from '@/components/checkout/receipt/ReceiptHeader';
import { ReceiptDetails } from '@/components/checkout/receipt/ReceiptDetails';
import { ReceiptItems } from '@/components/checkout/receipt/ReceiptItems';
import { ReceiptSummary } from '@/components/checkout/receipt/ReceiptSummary';
import { ReceiptActions } from '@/components/checkout/receipt/ReceiptActions';
import { ReceiptModal as BuyerReceiptModal } from '@/components/buyer/ReceiptModal';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'applications', label: 'Applications' },
  { key: 'orders', label: 'Orders' },
  { key: 'invoices', label: 'Delivery Invoices' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'sourcers', label: 'Sourcers' },
  { key: 'quotes', label: 'Quote Activity' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'logistics', label: 'Logistics' },
];

const SectionPlaceholder = ({ label }: { label: string }) => (
  <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
    <h2>{label}</h2>
    <p>Section coming soon...</p>
  </div>
);

// Mock user data and types
const mockUsers = [
  {
    id: '1',
    email: 'alice@example.com',
    created_at: '2024-01-01T12:00:00Z',
    full_name: 'Alice Smith',
    business_name: 'Alice Auto',
    whatsapp_number: '501234567',
    location: 'Dubai',
    roles: ['admin', 'sourcer'],
    google_maps_url: 'https://maps.google.com/?q=Dubai',
    tags: ['Premium Buyer'],
    status: 'active',
    address: {
      location: 'Dubai',
      address: 'Olivara Residence',
      contact_number: '567191045',
      special_instructions: '',
      google_maps_url: 'https://maps.google.com/?q=Dubai',
    },
  },
  {
    id: '2',
    email: 'bob@example.com',
    created_at: '2024-02-01T12:00:00Z',
    full_name: 'Bob Johnson',
    business_name: 'Bob Parts',
    whatsapp_number: '502345678',
    location: 'Abu Dhabi',
    roles: ['vendor', 'driver'],
    google_maps_url: 'https://maps.google.com/?q=Abu+Dhabi',
    tags: ['Flagged Vendor'],
    status: 'disabled',
    address: {
      location: 'Abu Dhabi',
      address: 'Some Tower',
      contact_number: '502345678',
      special_instructions: 'Leave at reception',
      google_maps_url: 'https://maps.google.com/?q=Abu+Dhabi',
    },
  },
  {
    id: '3',
    email: 'carol@example.com',
    created_at: '2024-03-01T12:00:00Z',
    full_name: 'Carol Lee',
    business_name: null,
    whatsapp_number: '503456789',
    location: 'Sharjah',
    roles: ['buyer'],
    google_maps_url: '',
    tags: [],
    status: 'active',
    address: {
      location: 'Sharjah',
      address: '',
      contact_number: '503456789',
      special_instructions: '',
      google_maps_url: '',
    },
  },
];

const ALL_ROLES = ['admin', 'vendor', 'buyer', 'sourcer', 'driver'];

// Role badge color map
const ROLE_COLORS = {
  admin: 'bg-blue-500 text-white',
  vendor: 'bg-green-500 text-white',
  buyer: 'bg-cyan-500 text-white',
  sourcer: 'bg-yellow-500 text-black',
  driver: 'bg-purple-500 text-white',
};

const UsersTab = () => {
  const [filter, setFilter] = React.useState('');
  const [sort, setSort] = React.useState({ key: 'created_at', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [editAddressModalOpen, setEditAddressModalOpen] = React.useState(false);
  const [addressDraft, setAddressDraft] = React.useState(null);
  const [userDraft, setUserDraft] = React.useState(null);
  const [partToRefund, setPartToRefund] = React.useState(null);

  // Enhanced filter: email, name, role, business, location
  const sortedAndFilteredUsers = React.useMemo(() => {
    let result = [...mockUsers];
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(user =>
        user.email?.toLowerCase().includes(f) ||
        user.full_name?.toLowerCase().includes(f) ||
        user.business_name?.toLowerCase().includes(f) ||
        user.location?.toLowerCase().includes(f) ||
        (user.roles && user.roles.some(role => role.toLowerCase().includes(f)))
      );
    }
    result.sort((a, b) => {
      if (sort.key === 'created_at') {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return sort.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (sort.key === 'role') {
        const aRole = a.roles?.[0] || '';
        const bRole = b.roles?.[0] || '';
        if (aRole < bRole) return sort.direction === 'asc' ? -1 : 1;
        if (aRole > bRole) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      }
      // fallback to email
      const aVal = a[sort.key] || '';
      const bVal = b[sort.key] || '';
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [filter, sort]);

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, direction: 'asc' });
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setUserDraft({ ...user });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserDraft(null);
  };

  // Handle field changes
  const handleDraftChange = (field, value) => {
    setUserDraft((prev) => ({ ...prev, [field]: value }));
  };
  const handleRoleToggle = (role) => {
    setUserDraft((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };
  const handleTagChange = (tags) => {
    setUserDraft((prev) => ({ ...prev, tags }));
  };
  const handleStatusToggle = () => {
    setUserDraft((prev) => ({ ...prev, status: prev.status === 'active' ? 'disabled' : 'active' }));
  };
  // Address modal logic
  const openEditAddress = () => {
    setAddressDraft({ ...userDraft.address });
    setEditAddressModalOpen(true);
  };
  const closeEditAddress = () => {
    setEditAddressModalOpen(false);
    setAddressDraft(null);
  };
  const handleAddressDraftChange = (field, value) => {
    setAddressDraft((prev) => ({ ...prev, [field]: value }));
  };
  const saveAddressDraft = () => {
    setUserDraft((prev) => ({ ...prev, address: { ...addressDraft } }));
    setEditAddressModalOpen(false);
  };

  const handleRefundPart = (part) => {
    setPartToRefund(part);
  };
  const confirmRefundPart = () => {
    if (partToRefund) {
      alert(`Refunded part ${partToRefund.name}`);
      setPartToRefund(null);
      // Here you would update the part status in real data
    }
  };
  const closeRefundDialog = () => setPartToRefund(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500">View, search, and manage all users on the platform (mock data).</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <Input
          placeholder="Filter by email, name, role, business, or location..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Email
              </TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                Roles
              </TableHead>
              <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
                Joined Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredUsers.map((user) => (
              <TableRow key={user.id} onClick={() => handleOpenModal(user)} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.business_name || 'N/A'}</TableCell>
                <TableCell>
                  {user.roles?.map(role => (
                    <span
                      key={role}
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold mr-1 mb-1 ${ROLE_COLORS[role] || 'bg-gray-300 text-black'}`}
                    >
                      {role}
                    </span>
                  ))}
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Modal for user details */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl p-0 bg-transparent shadow-none">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                User Details (Mock)
              </CardTitle>
              <CardDescription>View and edit user details. All changes are local only.</CardDescription>
            </CardHeader>
            {userDraft && (
              <form>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={userDraft.email} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={userDraft.full_name || ''} onChange={e => handleDraftChange('full_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input value={userDraft.business_name || ''} onChange={e => handleDraftChange('business_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input value={userDraft.whatsapp_number || ''} onChange={e => handleDraftChange('whatsapp_number', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={userDraft.location || ''} onChange={e => handleDraftChange('location', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Google Maps Link</Label>
                      <Input value={userDraft.google_maps_url || ''} onChange={e => handleDraftChange('google_maps_url', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Joined At</Label>
                      <Input value={new Date(userDraft.created_at).toLocaleDateString()} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ALL_ROLES.map(role => (
                        <Badge
                          key={role}
                          variant={userDraft.roles.includes(role) ? 'default' : 'secondary'}
                          className={`text-sm cursor-pointer ${userDraft.roles.includes(role) ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => handleRoleToggle(role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                  <div className="flex items-center gap-4">
                    <Label>Status</Label>
                    <Button type="button" variant={userDraft.status === 'active' ? 'default' : 'outline'} onClick={handleStatusToggle}>
                      {userDraft.status === 'active' ? 'Active' : 'Disabled'}
                    </Button>
                  </div>
                  {(userDraft.roles.includes('buyer') || userDraft.roles.includes('vendor')) && (
                    <Button type="button" variant="secondary" onClick={openEditAddress}>
                      Edit Address
                    </Button>
                  )}
                  <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </CardFooter>
              </form>
            )}
          </Card>
        </DialogContent>
      </Dialog>
      {/* Address Edit Modal */}
      <Dialog open={editAddressModalOpen} onOpenChange={closeEditAddress}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Delivery Address</DialogTitle>
          </DialogHeader>
          {addressDraft && (
            <form className="space-y-4">
              <div>
                <label>Location</label>
                <Input value={addressDraft.location} onChange={e => handleAddressDraftChange('location', e.target.value)} />
              </div>
              <div>
                <label>Address</label>
                <textarea className="w-full rounded border p-2" value={addressDraft.address} onChange={e => handleAddressDraftChange('address', e.target.value)} />
              </div>
              <div>
                <label>Delivery Contact Number</label>
                <Input value={addressDraft.contact_number} onChange={e => handleAddressDraftChange('contact_number', e.target.value)} />
                <div className="text-xs text-gray-500">Enter your number without the country code</div>
              </div>
              <div>
                <label>Special Instructions</label>
                <textarea className="w-full rounded border p-2" value={addressDraft.special_instructions} onChange={e => handleAddressDraftChange('special_instructions', e.target.value)} />
              </div>
              <div>
                <label>Google Maps URL</label>
                <Input value={addressDraft.google_maps_url} onChange={e => handleAddressDraftChange('google_maps_url', e.target.value)} />
              </div>
              <div>
                <Button type="button" onClick={saveAddressDraft}>Update Address</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Refund Part Confirmation Dialog */}
      <Dialog open={!!partToRefund} onOpenChange={closeRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Part</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to refund <b>{partToRefund?.name}</b>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRefundDialog}>No, Go Back</Button>
            <Button variant="destructive" onClick={confirmRefundPart}>Yes, Refund Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add ApplicationsTab and mock applications data
const mockApplications = [
  {
    id: 'a1',
    type: 'Buyer',
    name: 'Sarah Buyer',
    contact: '501234567',
    location: 'Dubai',
    date: '2024-06-01T10:00:00Z',
    status: 'Pending',
    email: 'sarah.buyer@example.com',
    password: '',
    emirate: 'Dubai',
    business_address: '',
    business_name: '',
    google_maps_url: '',
  },
  {
    id: 'a2',
    type: 'Vendor',
    name: 'Vendor Joe',
    contact: '502345678',
    location: 'Abu Dhabi',
    date: '2024-06-02T11:30:00Z',
    status: 'Pending',
    email: 'vendor.joe@example.com',
    password: '',
    emirate: 'Abu Dhabi',
    business_address: 'Business Tower, Floor 5',
    business_name: 'Joe Auto Parts',
    google_maps_url: 'https://maps.google.com/?q=Abu+Dhabi',
  },
];

const ApplicationsTab = () => {
  const [selectedApp, setSelectedApp] = React.useState(null);
  const [appDraft, setAppDraft] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setAppDraft({ ...app });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
    setAppDraft(null);
  };
  const handleDraftChange = (field, value) => {
    setAppDraft((prev) => ({ ...prev, [field]: value }));
  };
  const handleAccept = () => {
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-gray-500">Review and accept new applications.</p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.type}</TableCell>
                <TableCell>{app.name}</TableCell>
                <TableCell>{app.contact}</TableCell>
                <TableCell>{app.location}</TableCell>
                <TableCell>{new Date(app.date).toLocaleDateString()}</TableCell>
                <TableCell>{app.status}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleOpenModal(app)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg p-0 bg-transparent shadow-none">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                Application Details
              </CardTitle>
              <CardDescription>Review and edit application details before accepting.</CardDescription>
            </CardHeader>
            {appDraft && (
              <form>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={appDraft.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={appDraft.name} onChange={e => handleDraftChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input value={appDraft.contact} onChange={e => handleDraftChange('contact', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emirate</Label>
                    <Input value={appDraft.emirate} onChange={e => handleDraftChange('emirate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Input value={appDraft.business_address} onChange={e => handleDraftChange('business_address', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input value={appDraft.business_name} onChange={e => handleDraftChange('business_name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Maps URL to your location</Label>
                    <Input value={appDraft.google_maps_url} onChange={e => handleDraftChange('google_maps_url', e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                  <Button type="button" onClick={handleAccept} className="w-full md:w-auto">Accept</Button>
                  <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </CardFooter>
              </form>
            )}
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Refactored mock data for Orders, Deliveries, Invoices (add every possible eventuality)
const mockBuyers = [
  { id: 'b1', name: 'Alice Buyer', contact: '501234567', location: 'Dubai', email: 'alice@buyer.com' },
  { id: 'b2', name: 'Bob Buyer', contact: '502345678', location: 'Abu Dhabi', email: 'bob@buyer.com' },
  { id: 'b3', name: 'Charlie Buyer', contact: '503456789', location: 'Sharjah', email: 'charlie@buyer.com' },
];
const mockVendors = [
  { id: 'v1', name: 'Vendor One', contact: '509876543', location: 'Dubai', email: 'vendor1@vendor.com', company: 'Vendor One LLC' },
  { id: 'v2', name: 'Vendor Two', contact: '508765432', location: 'Sharjah', email: 'vendor2@vendor.com', company: 'Vendor Two LLC' },
  { id: 'v3', name: 'Vendor Three', contact: '507654321', location: 'Abu Dhabi', email: 'vendor3@vendor.com', company: 'Vendor Three LLC' },
];
const mockSourcers = [
  { id: 's1', name: 'Sally Sourcer', contact: '507654321', email: 'sally@sourcer.com' },
  { id: 's2', name: 'Sam Sourcer', contact: '506543210', email: 'sam@sourcer.com' },
];
const mockOrders = [
  // Open order, no deliveries yet, single vehicle
  {
    id: 'ORD-100',
    vehicles: [
      {
        vin: 'JTDBR32E720123456',
        make: 'Hyundai',
        model: 'Elantra',
        year: 2021,
        parts: [
          { id: 'p100', name: 'Front Bumper', partNumber: 'FB-100', quantity: 1, status: 'Awaiting Quote' },
          { id: 'p101', name: 'Rear Bumper', partNumber: 'RB-101', quantity: 1, status: 'Awaiting Quote' },
        ],
      },
    ],
    notes: 'Need ASAP',
    buyerId: 'b1',
    status: 'Awaiting Quotes',
    date: '2024-06-18T09:00:00Z',
    sourcerId: 's1',
  },
  // Open order, partially delivered, multiple vehicles
  {
    id: 'ORD-009',
    vehicles: [
      {
        vin: '4T1BF1FK0GU123456',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        parts: [
          { id: 'p1', name: 'Brake Pads', partNumber: 'BP-001', quantity: 2, status: 'Delivered' },
          { id: 'p2', name: 'Oil Filter', partNumber: 'OF-002', quantity: 1, status: 'Delivered' },
          { id: 'p3', name: 'Air Filter', partNumber: 'AF-003', quantity: 1, status: 'Awaiting Pickup' },
        ],
      },
      {
        vin: 'JH4KA9650MC123456',
        make: 'Honda',
        model: 'Accord',
        year: 2018,
        parts: [
          { id: 'p4', name: 'Spark Plug', partNumber: 'SP-004', quantity: 4, status: 'Out for Delivery' },
          { id: 'p5', name: 'Alternator', partNumber: 'ALT-005', quantity: 1, status: 'Awaiting Quote' },
        ],
      },
    ],
    notes: 'Urgent delivery needed',
    buyerId: 'b1',
    status: 'Partially Delivered',
    date: '2024-06-10T10:00:00Z',
    sourcerId: 's1',
  },
  // Fully delivered order, single vehicle
  {
    id: 'ORD-010',
    vehicles: [
      {
        vin: '1HGCM82633A123456',
        make: 'Honda',
        model: 'Accord',
        year: 2018,
        parts: [
          { id: 'p6', name: 'Timing Belt', partNumber: 'TB-006', quantity: 1, status: 'Delivered' },
          { id: 'p7', name: 'Water Pump', partNumber: 'WP-007', quantity: 1, status: 'Delivered' },
        ],
      },
    ],
    notes: 'Standard order',
    buyerId: 'b2',
    status: 'Fully Delivered',
    date: '2024-06-12T11:00:00Z',
    sourcerId: 's2',
  },
  // Cancelled order, single vehicle
  {
    id: 'ORD-011',
    vehicles: [
      {
        vin: 'JN1CV6EK9BM123456',
        make: 'Nissan',
        model: 'Patrol',
        year: 2022,
        parts: [
          { id: 'p8', name: 'Fuel Pump', partNumber: 'FP-008', quantity: 1, status: 'Cancelled' },
          { id: 'p9', name: 'Radiator', partNumber: 'RAD-009', quantity: 1, status: 'Cancelled' },
        ],
      },
    ],
    notes: 'Please deliver ASAP',
    buyerId: 'b3',
    status: 'Cancelled',
    date: '2024-06-13T12:00:00Z',
    sourcerId: 's1',
  },
  // Partially delivered, some parts not delivered yet, single vehicle
  {
    id: 'ORD-012',
    vehicles: [
      {
        vin: 'JM1GJ1V51E1234567',
        make: 'Mazda',
        model: '6',
        year: 2019,
        parts: [
          { id: 'p10', name: 'Headlight', partNumber: 'HL-010', quantity: 2, status: 'Delivered' },
          { id: 'p11', name: 'Tail Light', partNumber: 'TL-011', quantity: 2, status: 'Awaiting Pickup' },
          { id: 'p12', name: 'Battery', partNumber: 'BAT-012', quantity: 1, status: 'Delivered' },
        ],
      },
    ],
    notes: 'No rush',
    buyerId: 'b2',
    status: 'Partially Delivered',
    date: '2024-06-14T13:00:00Z',
    sourcerId: 's2',
  },
  // Fully delivered, multiple deliveries, single vehicle
  {
    id: 'ORD-013',
    vehicles: [
      {
        vin: '1FTFW1EF1EKE12345',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        parts: [
          { id: 'p13', name: 'Front Grille', partNumber: 'FG-013', quantity: 1, status: 'Delivered' },
          { id: 'p14', name: 'Rear Grille', partNumber: 'RG-014', quantity: 1, status: 'Delivered' },
          { id: 'p15', name: 'Fog Light', partNumber: 'FL-015', quantity: 2, status: 'Delivered' },
        ],
      },
    ],
    notes: 'Split delivery',
    buyerId: 'b3',
    status: 'Fully Delivered',
    date: '2024-06-15T14:00:00Z',
    sourcerId: 's2',
  },
];
const mockDeliveries = [
  // For ORD-009
  {
    id: 'D-102',
    orderId: 'ORD-009',
    parts: ['p1', 'p2', 'p3'],
    driver: 'Driver A',
    photo: '',
    notes: 'Delivered to reception',
    status: 'Delivered',
    timestamp: '2024-06-11T14:00:00Z',
    invoiceId: 'INV-334',
  },
  {
    id: 'D-108',
    orderId: 'ORD-009',
    parts: ['p4', 'p5'],
    driver: 'Driver B',
    photo: '',
    notes: 'Left at security',
    status: 'Delivered',
    timestamp: '2024-06-13T16:00:00Z',
    invoiceId: 'INV-351',
  },
  // For ORD-010
  {
    id: 'D-201',
    orderId: 'ORD-010',
    parts: ['p6'],
    driver: 'Driver C',
    photo: '',
    notes: 'Delivered to main office',
    status: 'Delivered',
    timestamp: '2024-06-15T10:00:00Z',
    invoiceId: 'INV-400',
  },
  {
    id: 'D-202',
    orderId: 'ORD-010',
    parts: ['p7'],
    driver: 'Driver D',
    photo: '',
    notes: 'Delivered to parking lot',
    status: 'Delivered',
    timestamp: '2024-06-16T11:00:00Z',
    invoiceId: 'INV-401',
  },
  // For ORD-012 (partial delivery)
  {
    id: 'D-301',
    orderId: 'ORD-012',
    parts: ['p10', 'p12'],
    driver: 'Driver E',
    photo: '',
    notes: 'Partial delivery',
    status: 'Delivered',
    timestamp: '2024-06-17T12:00:00Z',
    invoiceId: 'INV-500',
  },
  // For ORD-013 (fully delivered, multiple deliveries)
  {
    id: 'D-401',
    orderId: 'ORD-013',
    parts: ['p13'],
    driver: 'Driver F',
    photo: '',
    notes: 'First part delivered',
    status: 'Delivered',
    timestamp: '2024-06-18T09:00:00Z',
    invoiceId: 'INV-600',
  },
  {
    id: 'D-402',
    orderId: 'ORD-013',
    parts: ['p14', 'p15'],
    driver: 'Driver G',
    photo: '',
    notes: 'Rest delivered',
    status: 'Delivered',
    timestamp: '2024-06-19T10:00:00Z',
    invoiceId: 'INV-601',
  },
];
const mockInvoices = [
  {
    id: 'INV-334',
    deliveryId: 'D-102',
    parts: [
      { id: 'p1', name: 'Brake Pads', price: 200, vat: 10 },
      { id: 'p2', name: 'Oil Filter', price: 50, vat: 2.5 },
      { id: 'p3', name: 'Air Filter', price: 90, vat: 4.5 },
    ],
    serviceCharge: 50,
    total: 600,
    paymentMethod: 'Card',
    receiptPhoto: '',
    status: 'Paid',
  },
  {
    id: 'INV-351',
    deliveryId: 'D-108',
    parts: [
      { id: 'p4', name: 'Spark Plug', price: 40, vat: 2 },
      { id: 'p5', name: 'Alternator', price: 200, vat: 10 },
    ],
    serviceCharge: 10,
    total: 250,
    paymentMethod: 'Cash',
    receiptPhoto: '',
    status: 'Paid',
  },
  {
    id: 'INV-400',
    deliveryId: 'D-201',
    parts: [
      { id: 'p6', name: 'Timing Belt', price: 300, vat: 15 },
    ],
    serviceCharge: 20,
    total: 335,
    paymentMethod: 'Card',
    receiptPhoto: '',
    status: 'Paid',
  },
  {
    id: 'INV-401',
    deliveryId: 'D-202',
    parts: [
      { id: 'p7', name: 'Water Pump', price: 150, vat: 7.5 },
    ],
    serviceCharge: 15,
    total: 172.5,
    paymentMethod: 'Card',
    receiptPhoto: '',
    status: 'Paid',
  },
  {
    id: 'INV-500',
    deliveryId: 'D-301',
    parts: [
      { id: 'p10', name: 'Headlight', price: 120, vat: 6 },
      { id: 'p12', name: 'Battery', price: 250, vat: 12.5 },
    ],
    serviceCharge: 30,
    total: 418.5,
    paymentMethod: 'Cash',
    receiptPhoto: '',
    status: 'Pending',
  },
  {
    id: 'INV-600',
    deliveryId: 'D-401',
    parts: [
      { id: 'p13', name: 'Front Grille', price: 400, vat: 20 },
    ],
    serviceCharge: 25,
    total: 445,
    paymentMethod: 'Card',
    receiptPhoto: '',
    status: 'Paid',
  },
  {
    id: 'INV-601',
    deliveryId: 'D-402',
    parts: [
      { id: 'p14', name: 'Rear Grille', price: 350, vat: 17.5 },
      { id: 'p15', name: 'Fog Light', price: 80, vat: 4 },
    ],
    serviceCharge: 20,
    total: 451.5,
    paymentMethod: 'Cash',
    receiptPhoto: '',
    status: 'Refunded',
  },
];

const OrdersTab = () => {
  const [activeSubTab, setActiveSubTab] = React.useState<'open' | 'history'>('open');
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedDelivery, setSelectedDelivery] = React.useState(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [partToCancel, setPartToCancel] = React.useState(null);
  const [partToRefund, setPartToRefund] = React.useState(null);

  // Filtering
  const filteredOrders = mockOrders.filter(order => {
    if (activeSubTab === 'open') {
      return order.status !== 'Fully Delivered' && order.status !== 'Cancelled';
    } else {
      return order.status === 'Fully Delivered' || order.status === 'Cancelled';
    }
  }).filter(order => {
    if (!search) return true;
    const buyer = mockBuyers.find(b => b.id === order.buyerId);
    return (
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (buyer && buyer.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Helper functions
  const getBuyer = (id) => mockBuyers.find(b => b.id === id);
  const getSourcer = (id) => mockSourcers.find(s => s.id === id);
  const getOrderDeliveries = (orderId) => mockDeliveries.filter(d => d.orderId === orderId);
  const getDeliveryInvoice = (deliveryId) => mockInvoices.find(inv => inv.deliveryId === deliveryId);

  // Actions
  const handleViewOrder = (order) => setSelectedOrder(order);
  const handleViewDelivery = (delivery) => setSelectedDelivery(delivery);
  const handleViewInvoice = (invoice) => setSelectedInvoice(invoice);

  // Handler for cancel confirmation
  const handleCancelPart = (part) => {
    setPartToCancel(part);
  };
  const confirmCancelPart = () => {
    if (partToCancel) {
      alert(`Cancelled part ${partToCancel.name}`);
      setPartToCancel(null);
      // Here you would update the part status in real data
    }
  };
  const closeCancelDialog = () => setPartToCancel(null);

  const handleRefundPart = (part) => {
    setPartToRefund(part);
  };
  const confirmRefundPart = () => {
    if (partToRefund) {
      alert(`Refunded part ${partToRefund.name}`);
      setPartToRefund(null);
      // Here you would update the part status in real data
    }
  };
  const closeRefundDialog = () => setPartToRefund(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant={activeSubTab === 'open' ? 'default' : 'outline'} onClick={() => setActiveSubTab('open')}>Open Orders</Button>
        <Button variant={activeSubTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveSubTab('history')}>Order History</Button>
        <Input placeholder="Search by order ID or buyer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs ml-auto" />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Parts Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => {
              const deliveries = getOrderDeliveries(order.id);
              const deliveredParts = deliveries.flatMap(d => d.parts).length;
              const totalParts = (order.vehicles || []).reduce((sum, v) => sum + ((v.parts && v.parts.length) || 0), 0);
              return (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{getBuyer(order.buyerId)?.name}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{deliveredParts} of {totalParts}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleViewOrder(order)}>View</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl p-0 bg-transparent shadow-none">
            <Card className="w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Order Details
                </CardTitle>
                <CardDescription>All order, buyer, sourcer, and delivery info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="font-medium text-gray-600">Order ID: <span className="font-normal text-gray-900">{selectedOrder.id}</span></div>
                  <div className="font-medium text-gray-600">Date: <span className="font-normal text-gray-900">{new Date(selectedOrder.date).toLocaleDateString()}</span></div>
                  <div className="font-medium text-gray-600">Status: <span className="font-normal text-gray-900">{selectedOrder.status}</span></div>
                  <div className="font-medium text-gray-600">Buyer: <span className="font-normal text-gray-900">{getBuyer(selectedOrder.buyerId)?.name}</span></div>
                  <div className="font-medium text-gray-600">Buyer Contact: <span className="font-normal text-gray-900">{getBuyer(selectedOrder.buyerId)?.contact}</span></div>
                  <div className="font-medium text-gray-600">Buyer Location: <span className="font-normal text-gray-900">{getBuyer(selectedOrder.buyerId)?.location}</span></div>
                </div>
                {(selectedOrder.vehicles || []).map(vehicle => (
                  <div key={vehicle.vin} className="mt-4">
                    <div className="font-semibold text-base mb-1">{vehicle.make} {vehicle.model} {vehicle.year} <span className="text-xs text-gray-500 ml-2">VIN: {vehicle.vin}</span></div>
                    <Label>Requested Parts</Label>
                    <ul className="list-none ml-0 text-sm text-gray-800 divide-y divide-gray-100">
                      {(vehicle.parts || []).map(part => {
                        const partStatus = part.status || 'Awaiting Quote';
                        const canCancel = !['Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].includes(partStatus);
                        const canRefund = partStatus === 'Delivered';
                        return (
                          <li key={part.id} className="flex items-center justify-between py-1">
                            <div>
                              <span className="font-medium">{part.name}</span> <span className="text-xs text-gray-500">({part.partNumber})</span> (x{part.quantity})
                              <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">{partStatus}</span>
                            </div>
                            <div className="flex gap-2">
                              {canCancel && (
                                <Button size="sm" variant="destructive" onClick={() => handleCancelPart(part)}>Cancel</Button>
                              )}
                              {canRefund && (
                                <Button size="sm" variant="outline" onClick={() => handleRefundPart(part)}>Refund</Button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <div className="mt-4">
                  <Label>Deliveries</Label>
                  <div className="space-y-4 mt-2">
                    {getOrderDeliveries(selectedOrder.id).map(delivery => (
                      <Card key={delivery.id} className="p-4 border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="font-semibold">Delivery #{delivery.id}</div>
                            <div className="text-sm text-gray-500">Driver: {delivery.driver}</div>
                            <div className="text-sm text-gray-500">Status: {delivery.status}</div>
                            <div className="text-sm text-gray-500">Delivered: {new Date(delivery.timestamp).toLocaleString()}</div>
                            {(selectedOrder.vehicles || []).map(vehicle => (
                              <div key={vehicle.vin} className="mt-2">
                                <div className="font-semibold text-xs text-gray-700">{vehicle.make} {vehicle.model} {vehicle.year} <span className="text-xs text-gray-400 ml-2">VIN: {vehicle.vin}</span></div>
                                <div className="text-xs text-gray-600">Parts: {(vehicle.parts || []).filter(part => (delivery.parts || []).includes(part.id)).map(part => `${part.name} (${part.partNumber})`).join(', ') || 'None'}</div>
                              </div>
                            ))}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(getDeliveryInvoice(delivery.id))}>More Details</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
              </CardFooter>
            </Card>
          </DialogContent>
        </Dialog>
      )}
      {/* Cancel Part Confirmation Dialog */}
      <Dialog open={!!partToCancel} onOpenChange={closeCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Part</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to cancel <b>{partToCancel?.name}</b>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog}>No, Go Back</Button>
            <Button variant="destructive" onClick={confirmCancelPart}>Yes, Cancel Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Refund Part Confirmation Dialog */}
      <Dialog open={!!partToRefund} onOpenChange={closeRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Part</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to refund <b>{partToRefund?.name}</b>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRefundDialog}>No, Go Back</Button>
            <Button variant="destructive" onClick={confirmRefundPart}>Yes, Refund Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Invoice Details Modal for Admin */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl p-0 bg-transparent shadow-none">
            <Card className="w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Invoice Details
                </CardTitle>
                <CardDescription>All invoice, delivery, and vendor info for this delivery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="font-medium text-gray-600">Invoice ID: <span className="font-normal text-gray-900">{selectedInvoice.id}</span></div>
                  <div className="font-medium text-gray-600">Delivery ID: <span className="font-normal text-gray-900">{selectedInvoice.deliveryId}</span></div>
                  <div className="font-medium text-gray-600">Status: <span className="font-normal text-gray-900">{selectedInvoice.status}</span></div>
                  <div className="font-medium text-gray-600">Payment Method: <span className="font-normal text-gray-900">{selectedInvoice.paymentMethod}</span></div>
                  <div className="font-medium text-gray-600">Total: <span className="font-normal text-gray-900">AED {selectedInvoice.total}</span></div>
                </div>
                <div className="mt-4">
                  <Label>Parts Breakdown</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Name</TableHead>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Vendor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedInvoice.parts || []).map(part => {
                        // Find vendor info for this part (mock)
                        const vendor = mockVendors.find(v => v.id === part.vendorId) || mockVendors[0];
                        return (
                          <TableRow key={part.id}>
                            <TableCell>{part.name}</TableCell>
                            <TableCell>{part.partNumber || '-'}</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>AED {part.price?.toFixed(2) ?? '-'}</TableCell>
                            <TableCell>AED {part.price?.toFixed(2) ?? '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{vendor.name}</span>
                                <span className="text-xs text-gray-500">{vendor.contact}</span>
                                <span className="text-xs text-gray-500">{vendor.email}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
              </CardFooter>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Delivery Invoices Tab
const DeliveryInvoicesTab = () => {
  const [search, setSearch] = React.useState('');
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const filteredInvoices = mockInvoices.filter(inv => {
    if (!search) return true;
    return (
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      mockDeliveries.find(d => d.id === inv.deliveryId && d.orderId.toLowerCase().includes(search.toLowerCase()))
    );
  });
  const getDelivery = (id) => mockDeliveries.find(d => d.id === id);
  const getOrder = (id) => mockOrders.find(o => o.id === id);
  const handleViewInvoice = (invoice) => setSelectedInvoice(invoice);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input placeholder="Search by invoice, delivery, or order..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs ml-auto" />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Delivery ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map(inv => {
              const delivery = getDelivery(inv.deliveryId);
              const order = delivery ? getOrder(delivery.orderId) : null;
              return (
                <TableRow key={inv.id}>
                  <TableCell>{inv.id}</TableCell>
                  <TableCell>{inv.deliveryId}</TableCell>
                  <TableCell>{delivery?.orderId}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                  <TableCell>{inv.total}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleViewInvoice(inv)}>More Details</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-3xl p-0 bg-transparent shadow-none">
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Use the same layout as PaymentReceipt */}
              <ReceiptHeader orderId={selectedInvoice.orderId || 'N/A'} isAdmin={true} />
              {/* For demo, pass selectedInvoice as both invoice and order, and acceptedBids as empty array */}
              <ReceiptDetails invoice={selectedInvoice} order={selectedInvoice} />
              <ReceiptItems acceptedBids={[]} />
              <ReceiptSummary invoice={selectedInvoice} />
              <ReceiptActions />
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Add LogisticsTab for admin logistics summary
const LogisticsTab = ({ setActiveSection }) => {
  // Mock data
  const mockDrivers = [
    { id: 'd1', name: 'Driver A', contact: '+971 50 111 1111' },
    { id: 'd2', name: 'Driver B', contact: '+971 50 222 2222' },
  ];
  const mockActiveDeliveries = [
    {
      id: 'DEL-001', orderId: 'ORD-009', driverId: 'd1', pickup: 'Warehouse A', dropoff: 'Dubai Marina', pickedUpAt: '2024-06-20T13:30:00Z', amount: 500, status: 'Out for Delivery', cod: true
    },
    {
      id: 'DEL-002', orderId: 'ORD-012', driverId: 'd2', pickup: 'Warehouse B', dropoff: 'Abu Dhabi', pickedUpAt: '2024-06-20T15:00:00Z', amount: 350, status: 'Out for Delivery', cod: true
    },
  ];
  const mockReceipts = [
    {
      id: 'REC-100', deliveryId: 'DEL-003', orderId: 'ORD-010', driverId: 'd1', deliveredAt: '2024-06-19T15:00:00Z', amount: 600, payment: 'Cash'
    },
    {
      id: 'REC-101', deliveryId: 'DEL-004', orderId: 'ORD-013', driverId: 'd2', deliveredAt: '2024-06-19T18:00:00Z', amount: 800, payment: 'Card'
    },
  ];
  // Stats
  const activeCount = mockActiveDeliveries.length;
  const moneyToCollect = mockActiveDeliveries.reduce((sum, d) => sum + (d.cod ? d.amount : 0), 0);
  const totalEarnings = mockReceipts.reduce((sum, r) => sum + r.amount, 0);
  const avgDeliveryTime = '1h 20m'; // Mocked
  // State for modals
  const [selectedDelivery, setSelectedDelivery] = React.useState(null);
  const [selectedReceipt, setSelectedReceipt] = React.useState(null);
  const [expandedDelivery, setExpandedDelivery] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('collection'); // 'collection', 'active', 'receipts'
  // Helper
  const getDriver = (id) => mockDrivers.find(d => d.id === id);
  const getBuyer = (orderId) => {
    // Use mockBuyers from above, find by orderId
    const order = mockOrders.find(o => o.id === orderId);
    return order ? mockBuyers.find(b => b.id === order.buyerId) : null;
  };
  // Group deliveries by buyer
  const deliveriesByBuyer: Record<string, { buyer: any, deliveries: any[] }> = {};
  mockActiveDeliveries.forEach(d => {
    const buyer = getBuyer(d.orderId);
    if (!buyer) return;
    if (!deliveriesByBuyer[buyer.id]) deliveriesByBuyer[buyer.id] = { buyer, deliveries: [] };
    deliveriesByBuyer[buyer.id].deliveries.push(d);
  });
  // Helper to get parts for a delivery (from mockOrders)
  const getPartsForDelivery = (orderId) => {
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) return [];
    // Flatten all vehicle parts
    return (order.vehicles || []).flatMap(v => (v.parts || []));
  };
  // Handler for More Details: switch to Orders tab and open modal for order
  const handleMoreDetails = (orderId) => {
    setActiveSection('orders');
    window.dispatchEvent(new CustomEvent('openOrderModal', { detail: { orderId } }));
  };
  // In LogisticsTab, add mock parts ready for collection
  const mockReadyParts = [
    {
      id: 'p100', name: 'Brake Pads', partNumber: 'BP-001', quantity: 2, buyer: 'Alice Buyer', vendor: 'Vendor One LLC', pickupLocation: 'Warehouse A, Dubai', readySince: '2024-06-20T10:00:00Z', status: 'READY_FOR_PICKUP'
    },
    {
      id: 'p101', name: 'Oil Filter', partNumber: 'OF-002', quantity: 1, buyer: 'Alice Buyer', vendor: 'Vendor One LLC', pickupLocation: 'Warehouse A, Dubai', readySince: '2024-06-20T10:00:00Z', status: 'READY_FOR_PICKUP'
    },
    {
      id: 'p102', name: 'Air Filter', partNumber: 'AF-003', quantity: 1, buyer: 'Bob Buyer', vendor: 'Vendor Two LLC', pickupLocation: 'Vendor Two, Sharjah', readySince: '2024-06-20T09:30:00Z', status: 'READY_FOR_PICKUP'
    },
    {
      id: 'p103', name: 'Spark Plug', partNumber: 'SP-004', quantity: 4, buyer: 'Charlie Buyer', vendor: 'Vendor Two LLC', pickupLocation: 'Vendor Two, Sharjah', readySince: '2024-06-20T09:45:00Z', status: 'READY_FOR_PICKUP'
    },
  ];
  // Group by pickupLocation
  const readyPartsByLocation = mockReadyParts.reduce((acc, part) => {
    if (!acc[part.pickupLocation]) acc[part.pickupLocation] = [];
    acc[part.pickupLocation].push(part);
    return acc;
  }, {});
  return (
    <div className="space-y-8">
      {/* Tabs for sections */}
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === 'collection' ? 'default' : 'outline'} onClick={() => setActiveTab('collection')}>Collection</Button>
        <Button variant={activeTab === 'active' ? 'default' : 'outline'} onClick={() => setActiveTab('active')}>Active</Button>
        <Button variant={activeTab === 'receipts' ? 'default' : 'outline'} onClick={() => setActiveTab('receipts')}>Receipts</Button>
      </div>
      {/* Ready for Collection Section */}
      {activeTab === 'collection' && (
        <div>
          <div className="font-semibold mb-2">Ready for Collection ({mockReadyParts.length} parts)</div>
          {Object.entries(readyPartsByLocation).map(([location, parts]) => {
            const partsArr = parts as any[];
            return (
              <div key={location} className="mb-6">
                <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 rounded-t">Vendor: {partsArr[0].vendor} ({location})</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Ready Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partsArr.map(part => (
                      <TableRow key={part.id}>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.partNumber}</TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>{part.buyer}</TableCell>
                        <TableCell>{new Date(part.readySince).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      )}
      {/* Active Deliveries Table, single table with Buyer column */}
      {activeTab === 'active' && (
        <div>
          <div className="font-semibold mb-2">Active Deliveries</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Driver Contact</TableHead>
                <TableHead>Buyer Contact</TableHead>
                <TableHead>Dropoff</TableHead>
                <TableHead>Picked Up At</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActiveDeliveries.map(d => {
                const driver = getDriver(d.driverId);
                const buyer = getBuyer(d.orderId);
                const parts = getPartsForDelivery(d.orderId);
                const isExpanded = expandedDelivery === d.id;
                const whatsappLink = buyer?.contact ? `https://wa.me/${buyer.contact}` : null;
                return [
                  <TableRow key={d.id}>
                    <TableCell>{buyer?.name || '-'}</TableCell>
                    <TableCell>{driver?.name}</TableCell>
                    <TableCell>{driver?.contact}</TableCell>
                    <TableCell>
                      {buyer?.contact ? (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                          <MessageSquare className="w-4 h-4" />{buyer.contact}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{d.dropoff}</TableCell>
                    <TableCell>{new Date(d.pickedUpAt).toLocaleString()}</TableCell>
                    <TableCell>AED {d.amount}</TableCell>
                    <TableCell>
                      <button className="flex items-center gap-1 text-blue-600 hover:underline" onClick={() => setExpandedDelivery(isExpanded ? null : d.id)}>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} {parts.length} Parts
                      </button>
                    </TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => handleMoreDetails(d.orderId)}>More Details</Button></TableCell>
                  </TableRow>,
                  isExpanded && (
                    <TableRow key={d.id + '-parts'}>
                      <TableCell colSpan={9} className="bg-gray-50 p-0">
                        <div className="p-3">
                          <div className="font-semibold mb-1">Parts Being Delivered:</div>
                          <ul className="list-disc ml-6">
                            {parts.map((part, idx) => {
                              // Assign a vendor for demo (cycle through mockVendors)
                              const vendor = mockVendors[idx % mockVendors.length];
                              return (
                                <li key={part.id}>
                                  {part.name} <span className="text-xs text-gray-500">({part.partNumber})</span> x{part.quantity}
                                  <span className="ml-2 text-xs text-blue-700 font-semibold">Vendor: {vendor.name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ];
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Receipts Table */}
      {activeTab === 'receipts' && (
        <div>
          <div className="font-semibold mb-2">Receipts</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Delivered At</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReceipts.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.orderId}</TableCell>
                  <TableCell>{getDriver(r.driverId)?.name}</TableCell>
                  <TableCell>{new Date(r.deliveredAt).toLocaleString()}</TableCell>
                  <TableCell>AED {r.amount}</TableCell>
                  <TableCell>{r.payment}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => setSelectedReceipt(r)}>View Receipt</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Go to Delivery Portal */}
      <div className="flex justify-end">
        <a href="/delivery" target="_blank" rel="noopener noreferrer">
          <Button variant="default">Go to Delivery Portal</Button>
        </a>
      </div>
      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Delivery Details</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <div><b>Driver:</b> {getDriver(selectedDelivery.driverId)?.name}</div>
              <div><b>Driver Contact:</b> {getDriver(selectedDelivery.driverId)?.contact}</div>
              <div><b>Buyer Contact:</b> {getBuyer(selectedDelivery.orderId)?.contact || '-'}</div>
              <div><b>Dropoff:</b> {selectedDelivery.dropoff}</div>
              <div><b>Picked Up At:</b> {new Date(selectedDelivery.pickedUpAt).toLocaleString()}</div>
              <div><b>Amount to Collect:</b> AED {selectedDelivery.amount}</div>
              <div><b>Status:</b> {selectedDelivery.status}</div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setSelectedDelivery(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <BuyerReceiptModal
          isOpen={!!selectedReceipt}
          onOpenChange={(open) => { if (!open) setSelectedReceipt(null); }}
          orderId={selectedReceipt.orderId}
        />
      )}
    </div>
  );
};

const AdminDesign: React.FC = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardTab />;
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UsersTab />;
      case 'applications':
        return <ApplicationsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'invoices':
        return <DeliveryInvoicesTab />;
      case 'vendors':
        return <VendorsTab />;
      case 'sourcers':
        return <SourcersTab />;
      case 'quotes':
        return <QuoteActivityTab />;
      case 'reports':
        return <ReportsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'logistics':
        return <LogisticsTab setActiveSection={setActiveSection} />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      activeTab={activeSection as any}
      onTabChange={setActiveSection as any}
    >
      {renderSection()}
    </AdminLayout>
  );
};

export default AdminDesign; 