
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/utils/adminLogger';

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name?: string;
    whatsapp_number?: string;
    business_name?: string;
    location?: string;
  };
  roles?: string[];
}

export const useUserManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError && profilesError.code !== 'PGRST116') {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch user roles from the user_roles table
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Combine the data
      const combinedUsers = usersData.map(user => {
        const profile = profilesData?.find(p => p.id === user.id);
        const userRoles = userRolesData?.filter(ur => ur.user_id === user.id).map(ur => ur.role) || [];
        
        return {
          ...user,
          profile,
          roles: userRoles
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "Unable to fetch user data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'buyer' | 'vendor' | 'admin' | 'delivery_driver') => {
    try {
      const user = users.find(u => u.id === userId);
      const currentRoles = user?.roles || [];

      // Remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add the new primary role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (roleError) throw roleError;

      // Handle delivery driver specific logic
      if (newRole === 'delivery_driver') {
        // Check if delivery driver record already exists
        const { data: existingDriver } = await supabase
          .from('delivery_drivers')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingDriver) {
          // Create delivery driver record
          const { error: driverError } = await supabase
            .from('delivery_drivers')
            .insert({
              id: userId,
              user_id: userId,
              username: user?.email?.split('@')[0] || 'driver',
              password_hash: btoa('temp123'), // Temporary password hash
              full_name: user?.profile?.full_name || null,
              phone_number: user?.profile?.whatsapp_number || null,
              role: 'delivery_driver',
              is_active: true
            });

          if (driverError) throw driverError;
        }
      } else if (currentRoles.includes('delivery_driver')) {
        // Remove from delivery_drivers table when changing from delivery driver
        const { error: removeDriverError } = await supabase
          .from('delivery_drivers')
          .delete()
          .eq('id', userId);

        if (removeDriverError) {
          console.warn('Error removing delivery driver record:', removeDriverError);
        }
      }

      await logAdminAction('User Role Changed', userId, {
        old_roles: currentRoles,
        new_role: newRole,
        changed_by: currentUser?.email
      }, currentUser?.id);

      toast({
        title: "Role updated",
        description: `User role has been changed to ${newRole === 'delivery_driver' ? 'driver' : newRole}.`
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleVendorToggle = async (userId: string, currentVendorStatus: boolean, userName: string) => {
    if (updatingVendor) return;
    
    setUpdatingVendor(userId);
    
    try {
      const newVendorStatus = !currentVendorStatus;
      
      if (newVendorStatus) {
        // Add vendor role
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: 'vendor' });
        
        if (roleError) throw roleError;
      } else {
        // Remove vendor role
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'vendor');
        
        if (roleError) throw roleError;
      }

      await logAdminAction('Vendor Status Changed', userId, {
        user_name: userName,
        new_vendor_status: newVendorStatus,
        changed_by: currentUser?.email
      }, currentUser?.id);

      toast({
        title: "Vendor status updated",
        description: `${userName} ${newVendorStatus ? 'is now' : 'is no longer'} a vendor.`
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error updating vendor status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingVendor(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (deleting) return;
    
    setDeleting(userId);
    
    try {
      // Call the edge function for secure deletion
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId, userEmail }
      });

      if (error) throw error;

      if (data.success) {
        await logAdminAction('User Deleted', userId, {
          deleted_email: userEmail,
          deleted_by: currentUser?.email,
          note: 'User deleted but order history preserved'
        }, currentUser?.id);

        toast({
          title: "User deleted",
          description: `User ${userEmail} has been successfully deleted.`
        });

        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: error.message || 'Failed to delete user',
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    filteredUsers,
    setFilteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    vendorFilter,
    setVendorFilter,
    deleting,
    updatingVendor,
    currentUser,
    handleRoleChange,
    handleVendorToggle,
    handleDeleteUser,
    fetchUsers
  };
};
