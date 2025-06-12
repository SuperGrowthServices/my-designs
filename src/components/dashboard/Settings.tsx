
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  userProfile: any;
  onProfileUpdate: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ userProfile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    whatsapp_number: '',
    business_name: '',
    location: ''
  });

  useEffect(() => {
    // Initialize profile data from userProfile or auth metadata
    if (userProfile) {
      setProfileData({
        full_name: userProfile.full_name || '',
        whatsapp_number: userProfile.whatsapp_number || '',
        business_name: userProfile.business_name || '',
        location: userProfile.location || ''
      });
    } else if (user?.user_metadata) {
      // Fallback to auth metadata if profile doesn't exist
      const metadata = user.user_metadata;
      setProfileData({
        full_name: metadata.full_name || metadata.name || '',
        whatsapp_number: metadata.whatsapp_number || metadata.phone || '',
        business_name: metadata.business_name || '',
        location: metadata.location || ''
      });
    }
  }, [userProfile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            ...profileData,
            is_vendor: false,
            vendor_tags: []
          });

        if (error) throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      onProfileUpdate();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              value={profileData.whatsapp_number}
              onChange={(e) => setProfileData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name (Optional)</Label>
            <Input
              id="business_name"
              value={profileData.business_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="Your business name"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
