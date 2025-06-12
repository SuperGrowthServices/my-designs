import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RecentOrders } from './RecentOrders';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

const ALL_ROLES = ['admin', 'vendor', 'buyer'];

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user, roles: user.roles || [] });
    }
  }, [user]);

  if (!editedUser) return null;

  const handleRoleToggle = (role: string) => {
    setEditedUser(prev => {
      if (!prev) return null;
      const newRoles = prev.roles?.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...(prev.roles || []), role];
      return { ...prev, roles: newRoles };
    });
  };
  
  const handleSaveChanges = async () => {
    if (!editedUser?.id || !editedUser.roles) return;
    setIsSaving(true);
    const { error } = await (supabase.rpc as any)('update_user_roles', {
      p_user_id: editedUser.id,
      p_roles: editedUser.roles,
    });
    setIsSaving(false);
    if (error) {
      toast.error('Failed to update roles', { description: error.message });
    } else {
      toast.success('User roles updated successfully!');
      onUserUpdate();
      onClose();
    }
  };

  const handleDeleteUser = async () => {
    if (!editedUser?.id) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${editedUser.email}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    const { error } = await (supabase.rpc as any)('delete_user_admin', {
      p_user_id: editedUser.id,
    });
    setIsDeleting(false);
    if (error) {
      toast.error('Failed to delete user', { description: error.message });
    } else {
      toast.success('User deleted successfully!');
      onUserUpdate();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
          <div><Label>Email</Label><Input value={editedUser.email} readOnly /></div>
          <div><Label>Full Name</Label><Input value={editedUser.full_name || 'N/A'} readOnly /></div>
          <div><Label>Business Name</Label><Input value={editedUser.business_name || 'N/A'} readOnly /></div>
          <div><Label>WhatsApp</Label><Input value={editedUser.whatsapp_number || 'N/A'} readOnly /></div>
          <div><Label>Location</Label><Input value={editedUser.location || 'N/A'} readOnly /></div>
          <div><Label>Joined At</Label><Input value={new Date(editedUser.created_at).toLocaleDateString()} readOnly /></div>
        </div>
        
        <div>
          <Label>Roles</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {ALL_ROLES.map(role => (
              <Badge
                key={role}
                variant={editedUser.roles?.includes(role) ? 'default' : 'secondary'}
                onClick={() => handleRoleToggle(role)}
                className="cursor-pointer text-sm"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Recent Orders</h3>
          {editedUser?.id && <RecentOrders userId={editedUser.id} />}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
          <div className="flex-grow" />
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 