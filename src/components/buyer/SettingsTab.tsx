import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Bell, KeyRound } from "lucide-react";
import { ChangePasswordModal } from './ChangePasswordModal';

const mockProfile = {
    fullName: "hello@sgsservices.ae",
    whatsappNumber: "567191045",
    location: "Dubai",
    businessName: "SG Services",
};

const mockAddress = {
    location: "Dubai",
    address: "Olivara Residence",
    deliveryContact: "567191045",
    specialInstructions: "",
    googleMapsUrl: ""
};

const mockNotifications = {
    whatsapp: true,
    email: false,
};

export const SettingsTab = () => {
    
    const [profile, setProfile] = useState(mockProfile);
    const [address, setAddress] = useState(mockAddress);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Profile Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={profile.fullName} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                                +971
                            </span>
                            <Input id="whatsappNumber" value={profile.whatsappNumber} className="rounded-l-none" />
                        </div>
                         <p className="text-xs text-muted-foreground">Enter your number without the country code</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={profile.location} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name (Optional)</Label>
                        <Input id="businessName" value={profile.businessName} />
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-start">
                     <Button>Update Profile</Button>
                </div>
            </Card>

            {/* Delivery Address Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <MapPin className="mr-3 h-6 w-6 text-primary" />
                        Delivery Address
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="addressLocation">Location</Label>
                        <Input id="addressLocation" value={address.location} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={address.address} className="min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deliveryContact">Delivery Contact Number</Label>
                        <div className="flex">
                             <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                                +971
                            </span>
                            <Input id="deliveryContact" value={address.deliveryContact} className="rounded-l-none"/>
                        </div>
                        <p className="text-xs text-muted-foreground">Enter your number without the country code</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Textarea id="specialInstructions" placeholder="Any special instructions for pickup/delivery" className="min-h-[100px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                        <Input id="googleMapsUrl" placeholder="https://maps.google.com/..." />
                    </div>
                </CardContent>
                 <div className="p-6 pt-0 flex justify-start">
                     <Button>Update Address</Button>
                </div>
            </Card>

            {/* Notifications Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <Bell className="mr-3 h-6 w-6 text-primary" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Manage how you receive important updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="whatsapp-notifications" className="font-medium">WhatsApp Notifications</Label>
                            <p className="text-sm text-muted-foreground">For order status updates and direct support.</p>
                        </div>
                        <Switch
                            id="whatsapp-notifications"
                            checked={notifications.whatsapp}
                            onCheckedChange={(value) => setNotifications(prev => ({...prev, whatsapp: value}))}
                        />
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                             <p className="text-sm text-muted-foreground">For receipts and account information.</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={notifications.email}
                            onCheckedChange={(value) => setNotifications(prev => ({...prev, email: value}))}
                        />
                    </div>
                </CardContent>
                 <div className="p-6 pt-0 flex justify-end">
                     <Button>Save Changes</Button>
                </div>
            </Card>

            {/* Account Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <KeyRound className="mr-3 h-6 w-6 text-primary" />
                        Account
                    </CardTitle>
                    <CardDescription>Manage account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                       <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
                       </div>
                       <Button variant="outline" onClick={() => setChangePasswordModalOpen(true)}>Change Password</Button>
                   </div>
                </CardContent>
            </Card>
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onOpenChange={setChangePasswordModalOpen} />
        </div>
    );
}; 