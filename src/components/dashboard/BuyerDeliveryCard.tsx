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

interface BuyerDeliveryCardProps {
    userProfile: any;
    onProfileUpdate: () => void;
}

export const BuyerDeliveryCard: React.FC<BuyerDeliveryCardProps> = ({
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
                whatsapp_number: (userProfile.whatsapp_number || "").replace(
                    /^971/,
                    ""
                ),
                business_name: userProfile.business_name || "",
                location: userProfile.location || "",
                delivery_address: userProfile.delivery_address || "",
                delivery_phone: (userProfile.delivery_phone || "").replace(
                    /^971/,
                    ""
                ),
                delivery_instructions: userProfile.delivery_instructions || "",
                google_maps_url: userProfile.google_maps_url || "",
            });
        } else if (user?.user_metadata) {
            // Fallback to auth metadata if profile doesn't exist
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
                whatsapp_number: profileData.whatsapp_number.startsWith("971")
                    ? profileData.whatsapp_number
                    : `971${profileData.whatsapp_number}`,
                delivery_phone: profileData.delivery_phone.startsWith("971")
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
                const { error } = await supabase
                    .from("user_profiles")
                    .update(dataToSave)
                    .eq("id", user.id);

                if (error) throw error;
            } else {
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
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div>
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
                            placeholder="Enter your complete business location"
                        />
                    </div>

                    <div>
                        <Label htmlFor="delivery_address">Address</Label>
                        <Textarea
                            id="delivery_address"
                            value={profileData.delivery_address}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    delivery_address: e.target.value,
                                }))
                            }
                            placeholder="Enter your complete business address"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div>
                        <Label htmlFor="delivery_phone">
                            Delivery Contact Number
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                +971
                            </span>
                            <Input
                                id="delivery_phone"
                                value={profileData.delivery_phone}
                                onChange={(e) => {
                                    // Remove any non-numeric characters and the prefix if entered
                                    const cleaned = e.target.value
                                        .replace(/\D/g, "")
                                        .replace(/^971/, "");
                                    setProfileData((prev) => ({
                                        ...prev,
                                        delivery_phone: cleaned,
                                    }));
                                }}
                                className="pl-14"
                                placeholder="50 123 4567"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Enter your number without the country code
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="delivery_instructions">
                            Special Instructions
                        </Label>
                        <Textarea
                            id="delivery_instructions"
                            value={profileData.delivery_instructions}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    delivery_instructions: e.target.value,
                                }))
                            }
                            placeholder="Any special instructions for pickup/delivery"
                        />
                    </div>

                    <div>
                        <Label htmlFor="google_maps_url">Google Maps URL</Label>
                        <div className="space-y-2">
                            <Input
                                id="google_maps_url"
                                value={profileData.google_maps_url}
                                onChange={(e) =>
                                    setProfileData((prev) => ({
                                        ...prev,
                                        google_maps_url: e.target.value,
                                    }))
                                }
                                placeholder="https://maps.google.com/..."
                            />
                            {profileData.google_maps_url && (
                                <a
                                    href={profileData.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    View on Maps
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleUpdateProfile}
                        className="w-full md:w-auto">
                        Update Address
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
