import React, { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { RejectionDialog } from './RejectionDialog';

export const VendorApplications: React.FC = () => {
  const { vendorApplications, refresh: refetchVendorApplications } = useAdminData();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const [rejectionDialog, setRejectionDialog] = useState({
    isOpen: false,
    userId: null as string | null
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {  // Case-insensitive check
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleApprove = async (user_id: string) => {
  if (!user_id) {
    console.error('Invalid user_id:', user_id);
    toast({
      title: "Error",
      description: "Invalid user ID. Please try again.",
      variant: "destructive",
    });
    return;
  }

  setLoadingStates(prev => ({ ...prev, [user_id]: true }));
  
  try {
    // Update application status in user_profiles
    const { data: profileData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ application_status: 'approved' })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update user role to vendor and set is_approved to true
    const { data: roleData, error: roleUpdateError } = await supabase
      .from('user_roles')
      .update({ 
        role: 'vendor',
        is_approved: true 
      })
      .eq('user_id', user_id)
      .select()
      .single();

    if (roleUpdateError) throw roleUpdateError;

    await refetchVendorApplications();
    
    toast({
      title: "Application approved",
      description: "Vendor application has been approved successfully.",
      variant: "default",
    });
  } catch (error) {
    console.error('Approval failed:', error);
    toast({
      title: "Error",
      description: `Failed to approve the application: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setLoadingStates(prev => ({ ...prev, [user_id]: false }));
  }
};

  const handleReject = async (user_id: string) => {
    // Open rejection dialog instead of immediate rejection
    setRejectionDialog({
      isOpen: true,
      userId: user_id
    });
  };

  const handleConfirmReject = async (reason: string) => {
    const user_id = rejectionDialog.userId;
    if (!user_id) return;

    setLoadingStates(prev => ({ ...prev, [user_id]: true }));
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          application_status: 'rejected',
          rejection_reason: reason 
        })
        .eq('user_id', user_id);

      if (error) throw error;

      await refetchVendorApplications();
      
      toast({
        title: "Application rejected",
        description: "Vendor application has been rejected.",
        variant: "default",
      });
    } catch (error) {
      console.error('Rejection failed:', error);
      toast({
        title: "Error",
        description: `Failed to reject the application: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [user_id]: false }));
      setRejectionDialog({ isOpen: false, userId: null });
    }
  };

  const renderActionButtons = (application: any) => {
    const status = application.application_status?.toLowerCase();
    const isLoading = loadingStates[application.user_id] || false;

    // Only show actions for pending applications
    if (status === 'pending') {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={() => application.user_id && handleApprove(application.user_id)}
            disabled={isLoading || !application.user_id}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            {isLoading ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            onClick={() => application.user_id && handleReject(application.user_id)}
            disabled={isLoading || !application.user_id}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isLoading ? 'Processing...' : 'Reject'}
          </Button>
        </div>
      );
    }

    return null;
  };

  const filteredApplications = vendorApplications.filter(
    app => app.application_status !== 'not_applied'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Applications</h1>
        <p className="text-gray-500">Review and manage pending vendor applications.</p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.business_name || 'N/A'}</TableCell>
                <TableCell>{app.full_name}</TableCell>
                <TableCell>{app.whatsapp_number}</TableCell>
                <TableCell>{app.location}</TableCell>
                <TableCell>{format(new Date(app.application_submitted_at), 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(app.application_status)}>
                    {app.application_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {renderActionButtons(app)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <RejectionDialog
        isOpen={rejectionDialog.isOpen}
        onClose={() => setRejectionDialog({ isOpen: false, userId: null })}
        onConfirm={handleConfirmReject}
        loading={rejectionDialog.userId ? loadingStates[rejectionDialog.userId] : false}
      />
    </div>
  );
};