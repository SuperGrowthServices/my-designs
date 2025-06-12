import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PartForLogistics } from './LogisticsTable';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UpdatePartStatusModalProps {
  part: PartForLogistics | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdatePartStatusModal: React.FC<UpdatePartStatusModalProps> = ({
  part,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  if (!part) return null;

  const getNextStatus = () => {
    switch (part.current_status) {
      case 'pending_pickup':
        return 'collected';
      case 'collected':
        return 'delivered';
      case 'admin_collected':
        return 'delivered';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();
  const nextStatusDisplay = nextStatus ? nextStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
  const currentStatusDisplay = part.current_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleUpdate = async () => {
    if (!nextStatus || !user) {
      setError("You must be logged in to perform this action.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    const { error: rpcError } = await (supabase.rpc as any)('update_part_shipping_status', {
      part_id_arg: part.part_id,
      new_status: nextStatus,
      updater_id_arg: user.id
    });

    setIsUpdating(false);

    if (rpcError) {
      console.error('Error updating part status:', rpcError);
      setError(`Failed to update status: ${rpcError.message}`);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Part Status</DialogTitle>
          <DialogDescription>
            Update the shipping status for the selected part.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-2">
            <p><span className="font-semibold">Part:</span> {part.part_name} (x{part.quantity})</p>
            <p><span className="font-semibold">Order:</span> #{part.order_id.substring(0,8)}</p>
            <p><span className="font-semibold">Current Status:</span> {currentStatusDisplay}</p>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          {nextStatus ? (
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : `Confirm: ${nextStatusDisplay}`}
            </Button>
          ) : (
            <Button disabled>No further status</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 