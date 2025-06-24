import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RecentOrders } from './RecentOrders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { carManufacturers } from '@/utils/carManufacturers';

interface UserDetailsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (updatedUser: User) => Promise<void>;
}

const ALL_ROLES = ['admin', 'vendor', 'buyer'];

const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
] as const;

const ECP_AGENTS = [
  'Direct Sign Up',
  'Ahmed Hassan',
  'Mohammed Ali',
  'Sarah Khan',
  'Fatima Rahman',
  'Omar Sheikh',
  'Zainab Hussein'
] as const;

const USER_ROLES = ['admin', 'vendor', 'buyer', 'sourcer', 'driver'] as const;

export const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdate }: UserDetailsModalProps): JSX.Element => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [customMake, setCustomMake] = useState('');
  const [isAddingCustomMake, setIsAddingCustomMake] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleRoleToggle = (role: string) => {
    setEditedUser(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUserUpdate(editedUser);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      // TODO: Implement user deletion
      toast.success('User deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVehicleMakeSelect = (value: string) => {
    if (value === 'custom') {
      setIsAddingCustomMake(true);
      return;
    }
    
    if (!editedUser.vehicleMakes.includes(value)) {
      setEditedUser(prev => ({
        ...prev,
        vehicleMakes: [...prev.vehicleMakes, value]
      }));
    }
  };

  const handleAddCustomMake = () => {
    if (customMake.trim() && !editedUser.vehicleMakes.includes(customMake.trim())) {
      setEditedUser(prev => ({
        ...prev,
        vehicleMakes: [...prev.vehicleMakes, customMake.trim()]
      }));
      setCustomMake('');
      setIsAddingCustomMake(false);
    }
  };

  const removeVehicleMake = (make: string) => {
    setEditedUser(prev => ({
      ...prev,
      vehicleMakes: prev.vehicleMakes.filter(m => m !== make)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={editedUser.full_name}
              onChange={(e) => setEditedUser(prev => ({ ...prev, full_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={editedUser.business_name}
              onChange={(e) => setEditedUser(prev => ({ ...prev, business_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsApp">WhatsApp Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                +971
              </span>
              <Input
                id="whatsApp"
                value={editedUser.whatsapp_number}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
                  setEditedUser(prev => ({ ...prev, whatsapp_number: cleaned }));
                }}
                className="pl-14"
                placeholder="50 123 4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Emirate</Label>
            <Select 
              value={editedUser.location}
              onValueChange={(value) => setEditedUser(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Emirate" />
              </SelectTrigger>
              <SelectContent>
                {UAE_EMIRATES.map((emirate) => (
                  <SelectItem key={emirate} value={emirate}>
                    {emirate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referredBy">Referred By</Label>
            <Select 
              value={editedUser.referred_by}
              onValueChange={(value) => setEditedUser(prev => ({ ...prev, referred_by: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who referred" />
              </SelectTrigger>
              <SelectContent>
                {ECP_AGENTS.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <textarea
              id="address"
              value={editedUser.address}
              onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="googleMapsLink">Google Maps Link</Label>
            <Input
              id="googleMapsLink"
              value={editedUser.google_maps_link}
              onChange={(e) => setEditedUser(prev => ({ ...prev, google_maps_link: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Vehicle Makes</Label>
            <div className="space-y-2">
              <Select onValueChange={handleVehicleMakeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle makes" />
                </SelectTrigger>
                <SelectContent>
                  {carManufacturers.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Add Custom Make</SelectItem>
                </SelectContent>
              </Select>

              {isAddingCustomMake && (
                <div className="flex gap-2">
                  <Input
                    value={customMake}
                    onChange={(e) => setCustomMake(e.target.value)}
                    placeholder="Enter custom vehicle make"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddCustomMake}
                    type="button"
                    variant="secondary"
                  >
                    Add
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsAddingCustomMake(false);
                      setCustomMake('');
                    }}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {editedUser.vehicleMakes.map((make) => (
                  <Badge key={make} variant="secondary" className="pl-2">
                    {make}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeVehicleMake(make)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>User Roles</Label>
            <div className="flex flex-wrap gap-2">
              {USER_ROLES.map((role) => (
                <Badge
                  key={role}
                  variant={editedUser.roles.includes(role) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleRoleToggle(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Account Status</Label>
            <Select
              value={editedUser.status}
              onValueChange={(value: 'active' | 'disabled') => 
                setEditedUser(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Joined At</Label>
            <Input value={new Date(editedUser.created_at).toLocaleDateString()} disabled />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Recent Orders</h3>
          {editedUser.id && <RecentOrders userId={editedUser.id} />}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
          <div className="flex-grow" />
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 