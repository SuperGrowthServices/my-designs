import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Edit, Trash2, User, Phone, MessageCircle, Tag, CreditCard, ExternalLink } from 'lucide-react';
import { carManufacturers } from '@/utils/carManufacturers';

interface PickupAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  instructions?: string;
  google_maps_url?: string;
  is_default: boolean;
}

interface VendorProfile {
  id: string;
  full_name: string;
  business_name?: string;
  location: string;
  whatsapp_number: string;
  vendor_tags?: string[];
  bank_name?: string;
  bank_iban?: string;
}

export const VendorSettings: React.FC<{ userProfile: any; onProfileUpdate: () => void }> = ({
  userProfile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    business_name: '',
    location: '',
    whatsapp_number: ''
  });

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_iban: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    phone: '',
    instructions: '',
    google_maps_url: ''
  });

  useEffect(() => {
    if (user && userProfile) {
      setProfile(userProfile);
      setProfileForm({
        full_name: userProfile.full_name || '',
        business_name: userProfile.business_name || '',
        location: userProfile.location || '',
        whatsapp_number: userProfile.whatsapp_number || ''
      });
      setBankForm({
        bank_name: userProfile.bank_name || '',
        bank_iban: userProfile.bank_iban || ''
      });
      setSelectedTags(userProfile.vendor_tags || []);
      fetchPickupAddresses();
    }
  }, [user, userProfile]);

  const fetchPickupAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vendor_pickup_addresses')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickupAddresses(data || []);
    } catch (error) {
      console.error('Error fetching pickup addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name,
          business_name: profileForm.business_name,
          location: profileForm.location,
          whatsapp_number: profileForm.whatsapp_number,
          vendor_tags: selectedTags
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBankUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          bank_name: bankForm.bank_name,
          bank_iban: bankForm.bank_iban
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Bank details updated",
        description: "Your bank information has been updated successfully."
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating bank details",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddressSubmit = async () => {
    if (!user) return;

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('vendor_pickup_addresses')
          .update({
            name: addressForm.name,
            address: addressForm.address,
            phone: addressForm.phone,
            instructions: addressForm.instructions,
            google_maps_url: addressForm.google_maps_url
          })
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast({
          title: "Address updated",
          description: "Pickup address has been updated successfully."
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('vendor_pickup_addresses')
          .insert({
            vendor_id: user.id,
            name: addressForm.name,
            address: addressForm.address,
            phone: addressForm.phone,
            instructions: addressForm.instructions,
            google_maps_url: addressForm.google_maps_url,
            is_default: pickupAddresses.length === 0 // First address is default
          });

        if (error) throw error;

        toast({
          title: "Address added",
          description: "New pickup address has been added successfully."
        });
      }

      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        address: '',
        phone: '',
        instructions: '',
        google_maps_url: ''
      });
      fetchPickupAddresses();
    } catch (error: any) {
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_pickup_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Pickup address has been deleted successfully."
      });

      fetchPickupAddresses();
    } catch (error: any) {
      toast({
        title: "Error deleting address",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openAddressModal = (address?: PickupAddress) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        address: address.address,
        phone: address.phone,
        instructions: address.instructions || '',
        google_maps_url: address.google_maps_url || ''
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        address: '',
        phone: '',
        instructions: '',
        google_maps_url: ''
      });
    }
    setIsAddressModalOpen(true);
  };

  const addTag = (manufacturer: string) => {
    if (!selectedTags.includes(manufacturer)) {
      setSelectedTags([...selectedTags, manufacturer]);
    }
  };

  const removeTag = (manufacturer: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== manufacturer));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your vendor profile, pickup locations, and bank details.</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={profileForm.business_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Enter your business name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileForm.location}
                onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter your location"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={profileForm.whatsapp_number}
                onChange={(e) => setProfileForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="Enter your WhatsApp number"
              />
            </div>
          </div>
          <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={bankForm.bank_name}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder="e.g., Emirates NBD, ADCB, FAB"
              />
            </div>
            <div>
              <Label htmlFor="bank_iban">IBAN</Label>
              <Input
                id="bank_iban"
                value={bankForm.bank_iban}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_iban: e.target.value }))}
                placeholder="AE070331234567890123456"
              />
            </div>
          </div>
          <Button onClick={handleBankUpdate} className="w-full md:w-auto">
            Update Bank Details
          </Button>
        </CardContent>
      </Card>

      {/* Manufacturer Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Manufacturer Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Manufacturers You Work With</Label>
            <SearchableSelect
              options={carManufacturers}
              onChange={addTag}
              placeholder="Search manufacturers or type to add custom..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
            Update Tags
          </Button>
        </CardContent>
      </Card>

      {/* Pickup Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Locations
            </div>
            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openAddressModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Pickup Location' : 'Add Pickup Location'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Location Name</Label>
                    <Input
                      id="name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Workshop"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complete address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Contact number for this location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={addressForm.instructions}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Any special instructions for pickup"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">Google Maps URL (Optional)</Label>
                    <Input
                      id="google_maps_url"
                      value={addressForm.google_maps_url}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, google_maps_url: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  <Button onClick={handleAddressSubmit} className="w-full">
                    {editingAddress ? 'Update Location' : 'Add Location'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pickupAddresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No pickup locations added yet.</p>
              <p className="text-sm">Add a location where our delivery agents can collect your parts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pickupAddresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{address.name}</h3>
                        {address.is_default && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {address.phone}
                        </span>
                        {address.google_maps_url && (
                          <a
                            href={address.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <MapPin className="w-3 h-3" />
                            View on Maps
                            <ExternalLink className="w-2 h-2" />
                          </a>
                        )}
                      </div>
                      {address.instructions && (
                        <p className="text-xs text-gray-500 mt-2">
                          <MessageCircle className="w-3 h-3 inline mr-1" />
                          {address.instructions}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddressModal(address)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
