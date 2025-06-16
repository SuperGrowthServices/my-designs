import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  instructions?: string;
  google_maps_url?: string;
  is_default: boolean;
}

interface DeliveryAddressManagerProps {
  selectedAddress?: string;
  onAddressSelect?: (address: string, addressData?: DeliveryAddress) => void;
  showAddressForm?: boolean;
  onAddressUpdate?: () => void;
  compact?: boolean;
}

export const DeliveryAddressManager: React.FC<DeliveryAddressManagerProps> = ({
  selectedAddress,
  onAddressSelect,
  showAddressForm = true,
  onAddressUpdate,
  compact = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    instructions: '',
    google_maps_url: '',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_delivery_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
      
      // Auto-select default address if exists and no address is selected
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress && !selectedAddress && onAddressSelect) {
        handleAddressSelect(defaultAddress.id);
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error fetching addresses",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // If setting as default, unset other defaults
      if (formData.is_default) {
        await supabase
          .from('user_delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('user_delivery_addresses')
          .update(formData)
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast({
          title: "Address updated",
          description: "Your delivery address has been successfully updated."
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('user_delivery_addresses')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Address added",
          description: "Your delivery address has been successfully added."
        });
      }

      resetForm();
      fetchAddresses();
      onAddressUpdate?.();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      phone: address.phone,
      instructions: address.instructions || '',
      google_maps_url: address.google_maps_url || '',
      is_default: address.is_default
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('user_delivery_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Your delivery address has been successfully deleted."
      });

      fetchAddresses();
      onAddressUpdate?.();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error deleting address",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address && onAddressSelect) {
      const formattedAddress = `${address.address}\nPhone: ${address.phone}` + 
        (address.instructions ? `\nInstructions: ${address.instructions}` : '');
      onAddressSelect(formattedAddress, address);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      instructions: '',
      google_maps_url: '',
      is_default: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const extractGoogleMapsEmbed = (url: string) => {
    if (!url) return null;
    
    const placeIdMatch = url.match(/place\/([^\/]+)/);
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (placeIdMatch) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dM4xD0p3w8Gf1o&q=${encodeURIComponent(placeIdMatch[1])}`;
    } else if (coordsMatch) {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dM4xD0p3w8Gf1o&center=${coordsMatch[1]},${coordsMatch[2]}&zoom=15`;
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      {showAddressForm && (
        <div className="flex items-center justify-between">
          {!compact && <h4 className="font-medium">Delivery Addresses</h4>}
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>
      )}

      {/* Address Form */}
      {showForm && showAddressForm && (
        <div className="p-4 border border-dashed rounded-lg space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Home, Office"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone for delivery"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address including building, street, area, and city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Special instructions for delivery person"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_url">Google Maps URL (Optional)</Label>
              <Input
                id="google_maps_url"
                value={formData.google_maps_url}
                onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                placeholder="Paste Google Maps link for precise location"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="is_default">Set as default address</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address Selection */}
      <div className="space-y-3">
        {addresses.map((address) => (
          <div key={address.id} className={`p-3 border rounded-lg ${address.is_default ? 'border-blue-200 bg-blue-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {onAddressSelect && (
                  <input
                    type="radio"
                    id={address.id}
                    name="selectedAddress"
                    checked={selectedAddress === address.id}
                    onChange={() => handleAddressSelect(address.id)}
                    className="mt-1"
                  />
                )}
                <label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{address.name}</span>
                    {address.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  <p className="text-sm text-gray-500">📞 {address.phone}</p>
                  {address.instructions && (
                    <p className="text-sm text-gray-500">💬 {address.instructions}</p>
                  )}
                  {address.google_maps_url && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>Has location pin</span>
                    </div>
                  )}
                </label>
              </div>
              {showAddressForm && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Google Maps Embed */}
            {address.google_maps_url && extractGoogleMapsEmbed(address.google_maps_url) && !compact && (
              <div className="mt-3">
                <iframe
                  src={extractGoogleMapsEmbed(address.google_maps_url)!}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        ))}

        {addresses.length === 0 && !showForm && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No delivery addresses added yet</p>
            {showAddressForm && (
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-2"
              >
                Add Your First Address
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
