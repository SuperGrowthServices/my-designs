import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, User } from "lucide-react";
import { ChangePasswordModal } from '@/components/buyer/ChangePasswordModal'; // Can be reused

const mockSourcerProfile = {
    fullName: "John Smith",
    email: "john.smith@sourcer.com",
    phone: "501234567",
};

const Settings: React.FC = () => {
    const [profile, setProfile] = useState(mockSourcerProfile);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Profile Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <User className="mr-3 h-6 w-6 text-primary" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Manage your personal and contact information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={profile.fullName} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={profile.email} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                                +971
                            </span>
                            <Input id="phone" value={profile.phone} className="rounded-l-none" />
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-start">
                     <Button>Update Profile</Button>
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
                   <div className="flex items-center justify-between p-4 rounded-lg border">
                       <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
                       </div>
                       <Button variant="outline" onClick={() => setChangePasswordModalOpen(true)}>Change Password</Button>
                   </div>
                </CardContent>
            </Card>
            
            {/* Reusing the same modal, assuming it's generic enough */}
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onOpenChange={setChangePasswordModalOpen} />
        </div>
    );
};

export default Settings; 