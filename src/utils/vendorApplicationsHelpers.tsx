
import { Badge } from '@/components/ui/badge';

export const formatWhatsAppLink = (number: string) => {
  const cleanNumber = number.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}`;
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  }
};

export interface VendorApplication {
  id: string;
  full_name: string;
  email: string;
  business_name: string;
  whatsapp_number: string;
  location: string;
  vendor_tags: string[];
  bank_name: string;
  bank_iban: string;
  is_vendor: boolean;
  application_status: string;
  application_submitted_at: string;
  rejection_reason?: string;
  pickup_addresses?: any[];
}
