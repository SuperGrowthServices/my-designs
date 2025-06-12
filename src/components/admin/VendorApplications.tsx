import React, { useState, useMemo } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

export const VendorApplications: React.FC = () => {
  const { vendorApplications } = useAdminData();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
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
            {vendorApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.business_name || 'N/A'}</TableCell>
                <TableCell>{app.full_name}</TableCell>
                <TableCell>{app.whatsapp_number}</TableCell>
                <TableCell>{app.location}</TableCell>
                <TableCell>{format(new Date(app.application_submitted_at), 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(app.application_status)}>{app.application_status}</Badge>
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
                      <DropdownMenuItem disabled>Approve</DropdownMenuItem>
                      <DropdownMenuItem disabled>Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 