import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    User,
    Phone,
    MessageCircle,
    Tag,
    CreditCard,
    ExternalLink,
} from "lucide-react";
import { carManufacturers } from "@/utils/carManufacturers";
import { DeliveryAddressManager } from "@/components/shared/DeliveryAddressManager";

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

export const VendorSettings: React.FC<{
    userProfile: any;
    onProfileUpdate: () => void;
}> = ({ userProfile, onProfileUpdate }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(
        null
    );
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [profileForm, setProfileForm] = useState({
        full_name: "",
        business_name: "",
        location: "",
        whatsapp_number: "",
        delivery_address: "",
        delivery_phone: "",
        delivery_instructions: "",
        google_maps_url: "",
    });

    const [bankForm, setBankForm] = useState({
        bank_name: "",
        bank_iban: "",
    });

    const [addressForm, setAddressForm] = useState({
        name: "",
        address: "",
        phone: "",
        instructions: "",
        google_maps_url: "",
    });

    useEffect(() => {
        if (user && userProfile) {
            setProfile(userProfile);
            setProfileForm({
                full_name: userProfile.full_name || "",
                business_name: userProfile.business_name || "",
                location: userProfile.location || "",
                whatsapp_number: userProfile.whatsapp_number || "",
                delivery_address: userProfile.delivery_address || "",
                delivery_phone: userProfile.delivery_phone || "",
                delivery_instructions: userProfile.delivery_instructions || "",
                google_maps_url: userProfile.google_maps_url || "",
            });
            setBankForm({
                bank_name: userProfile.bank_name || "",
                bank_iban: userProfile.bank_iban || "",
            });
            setSelectedTags(userProfile.vendor_tags || []);
            fetchPickupAddresses();
        }
    }, [user, userProfile]);

    const fetchPickupAddresses = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("vendor_pickup_addresses")
                .select("*")
                .eq("vendor_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPickupAddresses(data || []);
        } catch (error) {
            console.error("Error fetching pickup addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("user_profiles")
                .update({
                    full_name: profileForm.full_name,
                    business_name: profileForm.business_name,
                    location: profileForm.location,
                    whatsapp_number: profileForm.whatsapp_number,
                    vendor_tags: selectedTags,
                    delivery_address: profileForm.delivery_address,
                    delivery_phone: profileForm.delivery_phone,
                    delivery_instructions: profileForm.delivery_instructions,
                    google_maps_url: profileForm.google_maps_url,
                })
                .eq("id", user.id);

            if (error) throw error;

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });

            onProfileUpdate();
        } catch (error: any) {
            toast({
                title: "Error updating profile",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleBankUpdate = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("user_profiles")
                .update({
                    bank_name: bankForm.bank_name,
                    bank_iban: bankForm.bank_iban,
                })
                .eq("id", user.id);

            if (error) throw error;

            toast({
                title: "Bank details updated",
                description:
                    "Your bank information has been updated successfully.",
            });

            onProfileUpdate();
        } catch (error: any) {
            toast({
                title: "Error updating bank details",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleAddressSubmit = async () => {
        if (!user) return;

        try {
            if (editingAddress) {
                // Update existing address
                const { error } = await supabase
                    .from("vendor_pickup_addresses")
                    .update({
                        name: addressForm.name,
                        address: addressForm.address,
                        phone: addressForm.phone,
                        instructions: addressForm.instructions,
                        google_maps_url: addressForm.google_maps_url,
                    })
                    .eq("id", editingAddress.id);

                if (error) throw error;

                toast({
                    title: "Address updated",
                    description:
                        "Pickup address has been updated successfully.",
                });
            } else {
                // Create new address
                const { error } = await supabase
                    .from("vendor_pickup_addresses")
                    .insert({
                        vendor_id: user.id,
                        name: addressForm.name,
                        address: addressForm.address,
                        phone: addressForm.phone,
                        instructions: addressForm.instructions,
                        google_maps_url: addressForm.google_maps_url,
                        is_default: pickupAddresses.length === 0, // First address is default
                    });

                if (error) throw error;

                toast({
                    title: "Address added",
                    description:
                        "New pickup address has been added successfully.",
                });
            }

            setIsAddressModalOpen(false);
            setEditingAddress(null);
            setAddressForm({
                name: "",
                address: "",
                phone: "",
                instructions: "",
                google_maps_url: "",
            });
            fetchPickupAddresses();
        } catch (error: any) {
            toast({
                title: "Error saving address",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        try {
            const { error } = await supabase
                .from("vendor_pickup_addresses")
                .delete()
                .eq("id", addressId);

            if (error) throw error;

            toast({
                title: "Address deleted",
                description: "Pickup address has been deleted successfully.",
            });

            fetchPickupAddresses();
        } catch (error: any) {
            toast({
                title: "Error deleting address",
                description: error.message,
                variant: "destructive",
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
                instructions: address.instructions || "",
                google_maps_url: address.google_maps_url || "",
            });
        } else {
            setEditingAddress(null);
            setAddressForm({
                name: "",
                address: "",
                phone: "",
                instructions: "",
                google_maps_url: "",
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
        setSelectedTags(selectedTags.filter((tag) => tag !== manufacturer));
    };

    const handleAddressChange = (field: string, value: string) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Settings
                </h1>
                <p className="text-gray-600">
                    Manage your vendor profile, pickup locations, and bank
                    details.
                </p>
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
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        full_name: e.target.value,
                                    }))
                                }
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                value={profileForm.business_name}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        business_name: e.target.value,
                                    }))
                                }
                                placeholder="Enter your business name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={profileForm.location}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        location: e.target.value,
                                    }))
                                }
                                placeholder="Enter your location"
                            />
                        </div>
                        <div>
                            <Label htmlFor="whatsapp_number">
                                WhatsApp Number
                            </Label>
                            <Input
                                id="whatsapp_number"
                                value={profileForm.whatsapp_number}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        whatsapp_number: e.target.value,
                                    }))
                                }
                                placeholder="Enter your WhatsApp number"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleProfileUpdate}
                        className="w-full md:w-auto">
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
                                onChange={(e) =>
                                    setBankForm((prev) => ({
                                        ...prev,
                                        bank_name: e.target.value,
                                    }))
                                }
                                placeholder="e.g., Emirates NBD, ADCB, FAB"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bank_iban">IBAN</Label>
                            <Input
                                id="bank_iban"
                                value={bankForm.bank_iban}
                                onChange={(e) =>
                                    setBankForm((prev) => ({
                                        ...prev,
                                        bank_iban: e.target.value,
                                    }))
                                }
                                placeholder="AE070331234567890123456"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleBankUpdate}
                        className="w-full md:w-auto">
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
                                onClick={() => removeTag(tag)}>
                                {tag} ×
                            </Badge>
                        ))}
                    </div>
                    <Button
                        onClick={handleProfileUpdate}
                        className="w-full md:w-auto">
                        Update Tags
                    </Button>
                </CardContent>
            </Card>

            {/* Business Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Business Address
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={profileForm.location}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
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
                                value={profileForm.delivery_address}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
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
                                Pickup Contact Number
                            </Label>
                            <Input
                                id="delivery_phone"
                                value={profileForm.delivery_phone}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        delivery_phone: e.target.value,
                                    }))
                                }
                                placeholder="Phone number for this location"
                            />
                        </div>

                        <div>
                            <Label htmlFor="delivery_instructions">
                                Special Instructions
                            </Label>
                            <Textarea
                                id="delivery_instructions"
                                value={profileForm.delivery_instructions}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        delivery_instructions: e.target.value,
                                    }))
                                }
                                placeholder="Any special instructions for pickup/delivery"
                            />
                        </div>

                        <div>
                            <Label htmlFor="google_maps_url">
                                Google Maps URL
                            </Label>
                            <div className="space-y-2">
                                <Input
                                    id="google_maps_url"
                                    value={profileForm.google_maps_url}
                                    onChange={(e) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            google_maps_url: e.target.value,
                                        }))
                                    }
                                    placeholder="https://maps.google.com/..."
                                />
                                {profileForm.google_maps_url && (
                                    <a
                                        href={profileForm.google_maps_url}
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
                            onClick={handleProfileUpdate}
                            className="w-full md:w-auto">
                            Update Address
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
