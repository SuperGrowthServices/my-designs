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

export const VendorApplications: React.FC = () => {
  const { vendorApplications, refresh: refetchVendorApplications } = useAdminData();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

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
    setLoadingUserId(user_id);
    
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ application_status: 'approved' })
        .eq('user_id', user_id);

      if (updateError) throw updateError;

      // Delete buyer role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', 'buyer');

      if (deleteError) throw deleteError;

      // Add vendor role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id, role: 'vendor' });

      if (insertError) throw insertError;

      await refetchVendorApplications();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleReject = async (user_id: string) => {
    setLoadingUserId(user_id);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ application_status: 'rejected' })
        .eq('user_id', user_id);

      if (error) throw error;

      await refetchVendorApplications();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoadingUserId(null);
    }
  };

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
            {vendorApplications.map((app) => {
              const status = app.application_status?.toLowerCase() || '';
              const isPending = status === 'pending';
              const isLoading = loadingUserId === app.user_id;
              
              return (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleApprove(app.user_id)}
                          disabled={!isPending || isLoading}
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReject(app.user_id)}
                          disabled={!isPending || isLoading}
                        >
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};