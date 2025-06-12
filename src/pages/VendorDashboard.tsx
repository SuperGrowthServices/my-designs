import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AuthModal } from '@/components/AuthModal';
import { VendorDashboardLayout } from '@/components/vendor/VendorDashboardLayout';
import { VendorHome } from '@/components/vendor/VendorHome';
import { ReadyToShip } from '@/components/vendor/ReadyToShip';
import { SalesHistory } from '@/components/vendor/SalesHistory';
import { VendorSettings } from '@/components/vendor/VendorSettings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export type VendorDashboardTab = 'home' | 'ready-to-ship' | 'sales-history' | 'settings';

const VendorDashboard = () => {
  const { user, loading } = useAuth();
  const { hasRole, isAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<VendorDashboardTab>('home');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      console.log('Fetching user profile for vendor:', user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        console.log('Vendor profile data:', profileData);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSwitchToBuyer = () => {
    navigate('/dashboard');
  };

  // Show auth modal if not logged in
  if (!loading && !user) {
    return (
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    );
  }

  // Show loading state
  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check vendor access: either has vendor role OR is admin
  const hasVendorAccess = hasRole('vendor') || isAdmin();

  // Show access restricted if not a vendor
  if (!hasVendorAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You need to be an approved vendor to access this dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Return to Buyer Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <VendorHome />;
      case 'ready-to-ship':
        return <ReadyToShip />;
      case 'sales-history':
        return <SalesHistory />;
      case 'settings':
        return <VendorSettings userProfile={userProfile} onProfileUpdate={fetchUserData} />;
      default:
        return <VendorHome />;
    }
  };

  return (
    <VendorDashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userProfile={userProfile}
      onSwitchToBuyer={handleSwitchToBuyer}
      isAdmin={isAdmin()}
    >
      {renderContent()}
    </VendorDashboardLayout>
  );
};

export default VendorDashboard;
