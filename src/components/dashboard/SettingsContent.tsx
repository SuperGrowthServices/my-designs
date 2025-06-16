import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from '@/components/dashboard/Settings';
import { Security } from '@/components/dashboard/Security';
import { DeliveryAddresses } from '@/components/dashboard/DeliveryAddresses';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles'; // Add this import
import { BuyerDeliveryCard } from './BuyerDeliveryCard';

interface SettingsContentProps {
  userProfile: any;
  onProfileUpdate: () => void;
  onShowVendorApplication: () => void;
  onSwitchToVendor: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  userProfile,
  onProfileUpdate,
  onShowVendorApplication,
  onSwitchToVendor
}) => {
  const { isAdmin } = useUserRoles(); // Add this hook

  const renderVendorSection = () => {
    // If user is admin, don't show vendor section at all
    if (isAdmin()) {
      return null;
    }

    const applicationStatus = userProfile?.application_status;

    if (applicationStatus === 'approved') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-green-800">
                You’re now a Verified Vendor!
              </h3>
              <p className="text-green-600 max-w-md">
                Your vendor application has been approved. You can now switch to the Vendor Dashboard to manage bids and orders.
              </p>
            </div>
            <Button
              onClick={onSwitchToVendor}
              className="bg-green-600 hover:bg-green-700"
            >
              🧰 Switch to Vendor Mode
            </Button>
          </div>
        </div>
      );
    }

    if (applicationStatus === 'pending') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-blue-800">
                Application Submitted
              </h3>
              <p className="text-blue-600 max-w-md">
                We're reviewing your application. You’ll be notified via email once it’s processed.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Application Status: <Badge variant="secondary">Under Review</Badge>
            </div>
          </div>
        </div>
      );
    }

    if (applicationStatus === 'rejected') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-red-800">
                Application Rejected
              </h3>
              <div className="text-red-600 max-w-md space-y-2">
                <p>Unfortunately, your vendor application was not accepted.</p>
                {userProfile?.rejection_reason && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-left">
                    <p className="text-sm font-medium text-red-800">Reason:</p>
                    <p className="text-sm text-red-700">{userProfile.rejection_reason}</p>
                  </div>
                )}
                <p className="text-sm">
                  If you have any questions, please contact support.
                </p>
              </div>
            </div>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      );
    }

    // Default: No application submitted
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Want to sell car parts?
        </h3>
        <p className="text-blue-600 mb-4">
          Apply to become a vendor and start earning by supplying car parts to buyers.
        </p>
        <Button
          onClick={onShowVendorApplication}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Apply to Become a Vendor
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Left Side - Profile & Security */}
        <div className="space-y-6">
          <Settings userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
          <Security />
          <BuyerDeliveryCard userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
          {renderVendorSection()}
        </div>
      </div>
    </div>
  );
};
