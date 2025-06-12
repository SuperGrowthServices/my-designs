
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { carManufacturers } from '@/utils/carManufacturers';
import { MapPin, Building, Phone, MessageCircle, Tag, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

interface VendorApplicationFormProps {
  userProfile: any;
  onApplicationSubmitted: () => void;
}

export const VendorApplicationForm: React.FC<VendorApplicationFormProps> = ({
  userProfile,
  onApplicationSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [formData, setFormData] = useState({
    // Business Details
    business_name: userProfile?.business_name || '',
    whatsapp_number: userProfile?.whatsapp_number || '',
    location: userProfile?.location || '',
    
    // Pickup Address Details
    pickup_name: '',
    pickup_address: '',
    pickup_phone: userProfile?.whatsapp_number || '',
    pickup_instructions: '',
    google_maps_url: '',
    
    // Bank Details
    bank_name: userProfile?.bank_name || '',
    bank_iban: userProfile?.bank_iban || ''
  });

  useEffect(() => {
    if (userProfile) {
      setSelectedTags(userProfile.vendor_tags || []);
      setApplicationStatus(userProfile.application_status || '');
      setRejectionReason(userProfile.rejection_reason || '');
    }
  }, [userProfile]);

  // If user already has an application status, show status instead of form
  if (applicationStatus === 'pending') {
    return (
      <Card className="max-w-4xl">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Thank you for your application!
              </h3>
              <p className="text-gray-600 max-w-md">
                Our team will review your vendor application and get back to you soon. 
                You will receive an update via email once your application has been processed.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Application Status: <Badge variant="secondary">Under Review</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applicationStatus === 'approved') {
    return (
      <Card className="max-w-4xl">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Congratulations! You're now a vendor
              </h3>
              <p className="text-gray-600 max-w-md">
                Your vendor application has been approved. You can now access the vendor dashboard 
                and start bidding on customer orders.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/vendor'}>
              Go to Vendor Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <Card className="max-w-4xl">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Application Rejected
              </h3>
              <div className="text-gray-600 max-w-md space-y-2">
                <p>Unfortunately, your vendor application has been rejected.</p>
                {rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-red-800">Reason:</p>
                    <p className="text-sm text-red-700">{rejectionReason}</p>
                  </div>
                )}
                <p className="text-sm">
                  If you have any questions or would like to appeal this decision, 
                  please contact our support team.
                </p>
              </div>
            </div>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Update user profile with application data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          business_name: formData.business_name,
          whatsapp_number: formData.whatsapp_number,
          vendor_tags: selectedTags,
          location: formData.location,
          bank_name: formData.bank_name,
          bank_iban: formData.bank_iban,
          application_status: 'pending',
          application_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create initial pickup address if provided
      if (formData.pickup_name && formData.pickup_address) {
        const { error: addressError } = await supabase
          .from('vendor_pickup_addresses')
          .insert({
            vendor_id: user.id,
            name: formData.pickup_name,
            address: formData.pickup_address,
            phone: formData.pickup_phone,
            instructions: formData.pickup_instructions,
            google_maps_url: formData.google_maps_url,
            is_default: true
          });

        if (addressError) throw addressError;
      }

      toast({
        title: "Application submitted",
        description: "Your vendor application has been submitted for review."
      });

      onApplicationSubmitted();
    } catch (error: any) {
      console.error('Error submitting vendor application:', error);
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = (manufacturer: string) => {
    if (!selectedTags.includes(manufacturer)) {
      setSelectedTags([...selectedTags, manufacturer]);
    }
  };

  const removeTag = (manufacturer: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== manufacturer));
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Apply to Become a Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Business Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+9715XXXXXXX"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Business Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Sharjah Industrial"
                  required
                />
              </div>
            </div>
          </div>

          {/* Manufacturer Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Manufacturer Tags</h3>
            </div>
            
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Primary Pickup Address</h3>
              <span className="text-sm text-gray-500">(Optional - can be added later)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup_name">Location Name</Label>
                <Input
                  id="pickup_name"
                  value={formData.pickup_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_name: e.target.value }))}
                  placeholder="e.g., Main Workshop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_phone">Phone Number</Label>
                <Input
                  id="pickup_phone"
                  value={formData.pickup_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_phone: e.target.value }))}
                  placeholder="Contact number for this location"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pickup_address">Address</Label>
                <Textarea
                  id="pickup_address"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_address: e.target.value }))}
                  placeholder="Enter complete address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_instructions">Special Instructions</Label>
                <Textarea
                  id="pickup_instructions"
                  value={formData.pickup_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_instructions: e.target.value }))}
                  placeholder="Any special instructions for pickup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Bank Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="e.g., Emirates NBD, ADCB, FAB"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_iban">UAE Bank Account (IBAN) *</Label>
                <Input
                  id="bank_iban"
                  value={formData.bank_iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_iban: e.target.value }))}
                  placeholder="AE070331234567890123456"
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
