import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea"; // Ensure this is the correct path
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DeliveryAddressManager } from "@/components/shared/DeliveryAddressManager";
import { MapPin, ExternalLink } from "lucide-react"; // Ensure this is the correct library or path

interface SettingsProps {
    userProfile: any;
    onProfileUpdate: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    userProfile,
    onProfileUpdate,
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        full_name: "",
        whatsapp_number: "",
        business_name: "",
        location: "",
        delivery_address: "",
        delivery_phone: "",
        delivery_instructions: "",
        google_maps_url: "",
    });

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                full_name: userProfile.full_name || "",
                whatsapp_number: (userProfile.whatsapp_number || "").replace(/^971/, ''),
                business_name: userProfile.business_name || "",
                location: userProfile.location || "",
                delivery_address: userProfile.delivery_address || "",
                delivery_phone: (userProfile.delivery_phone || "").replace(/^971/, ''),
                delivery_instructions: userProfile.delivery_instructions || "",
                google_maps_url: userProfile.google_maps_url || "",
            });
        } else if (user?.user_metadata) {
            const metadata = user.user_metadata;
            setProfileData({
                full_name: metadata.full_name || metadata.name || "",
                whatsapp_number:
(metadata.whatsapp_number || metadata.phone || "").replace(/^971/, ''),
                business_name: metadata.business_name || "",
                location: metadata.location || "",
                delivery_address: metadata.delivery_address || "",
                delivery_phone: (metadata.delivery_phone || "").replace(/^971/, ''),
                delivery_instructions: metadata.delivery_instructions || "",
                google_maps_url: metadata.google_maps_url || "",
            });
        }
    }, [userProfile, user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            // Add 971 prefix when saving
            const dataToSave = {
                ...profileData,
                whatsapp_number: profileData.whatsapp_number.startsWith('971') 
                    ? profileData.whatsapp_number 
                    : `971${profileData.whatsapp_number}`,
                delivery_phone: profileData.delivery_phone.startsWith('971')
                    ? profileData.delivery_phone
                    : `971${profileData.delivery_phone}`,
            };

            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

            if (existingProfile) {
                // Update existing profile
                const { error } = await supabase
                    .from("user_profiles")
                    .update(dataToSave)
                    .eq("id", user.id);

                if (error) throw error;
            } else {
                // Create new profile
                const { error } = await supabase.from("user_profiles").insert({
                    id: user.id,
                    ...dataToSave,
                    is_vendor: false,
                    vendor_tags: [],
                });

                if (error) throw error;
            }

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });

            onProfileUpdate();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error updating profile",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (field: string, value: string) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
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
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    full_name: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                +971
                            </span>
                            <Input
                                id="whatsapp_number"
                                value={profileData.whatsapp_number}
                                onChange={(e) => {
                                    // Remove any non-numeric characters and the prefix if entered
                                    const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
                                    setProfileData(prev => ({
                                        ...prev,
                                        whatsapp_number: cleaned
                                    }));
                                }}
                                className="pl-14"
                                placeholder="50 123 4567"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">Enter your number without the country code</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="business_name">
                            Business Name (Optional)
                        </Label>
                        <Input
                            id="business_name"
                            value={profileData.business_name}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    business_name: e.target.value,
                                }))
                            }
                            placeholder="Your business name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delivery_phone">Delivery Phone</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                +971
                            </span>
                            <Input
                                id="delivery_phone"
                                value={profileData.delivery_phone}
                                onChange={(e) => {
                                    // Remove any non-numeric characters and the prefix if entered
                                    const cleaned = e.target.value.replace(/\D/g, '').replace(/^971/, '');
                                    setProfileData(prev => ({
                                        ...prev,
                                        delivery_phone: cleaned
                                    }));
                                }}
                                className="pl-14"
                                placeholder="50 123 4567"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Enter your number without the country code</p>
                    </div>

                    {/* ...other form fields... */}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
