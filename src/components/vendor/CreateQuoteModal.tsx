import React, { useState } from 'react';
import { VendorPart } from '@/types/vendor';
import { QuoteCondition, QuoteWarranty, MyQuote } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CreateQuoteModalProps {
  part: VendorPart | null;
  orderId: string;
  onClose: () => void;
  onAddQuote: (orderId: string, partId: string, newQuote: MyQuote) => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({
  part,
  orderId,
  onClose,
  onAddQuote
}) => {
  if (!part) return null;

  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<QuoteCondition>('Used - Good');
  const [warranty, setWarranty] = useState<QuoteWarranty>('7 Days');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  console.log('Initial condition state:', condition);
  console.log('Initial warranty state:', warranty);

  const handleConditionChange = (value: string) => {
    console.log('Condition selected:', value);
    const newCondition = value as QuoteCondition;
    console.log('Setting condition to:', newCondition);
    setCondition(newCondition);
    console.log('Condition after set:', newCondition); // Note: state updates are async
  };

  const handleWarrantyChange = (value: string) => {
    console.log('Warranty selected:', value);
    const newWarranty = value as QuoteWarranty;
    console.log('Setting warranty to:', newWarranty);
    setWarranty(newWarranty);
    console.log('Warranty after set:', newWarranty); // Note: state updates are async
  };

  // Add useEffect to track state changes
  React.useEffect(() => {
    console.log('Current condition state:', condition);
  }, [condition]);

  React.useEffect(() => {
    console.log('Current warranty state:', warranty);
  }, [warranty]);


  const handleSubmit = async () => {
    if (!price) {
      toast({
        title: "Missing Price",
        description: "Please enter a price for your quote",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user (vendor)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Vendor authentication required');
      }

      let imageUrl: string | undefined;

      // Handle image upload if present
      if (imageFile) {
        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(imageFile.type)) {
          throw new Error('Only JPG, PNG, and WEBP images are allowed');
        }
        
        // Size limit (5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('File size exceeds 5MB limit');
        }

        // Generate unique filename
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}_${part.id}_${Date.now()}.${fileExt}`;
        const filePath = `quotes/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('mybucket')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('quotes')
          .getPublicUrl(uploadData.path);
        
        imageUrl = urlData.publicUrl;
      }

      // Create bid record
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert({
          part_id: part.id,
          vendor_id: user.id,
          price: parseFloat(price) || 0,
          condition,
          warranty,
          notes,
          image_url: imageUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (bidError) throw bidError;

      // Format response
      const newQuote: MyQuote = {
        id: bid.id,
        price: bid.price,
        condition: bid.condition,
        warranty: bid.warranty,
        notes: bid.notes || '',
        imageUrl: bid.image_url || undefined,
        isAccepted: false
      };

      onAddQuote(orderId, part.id, newQuote);
      onClose();
      
      toast({
        title: "Quote Submitted!",
        description: "Your quote has been successfully submitted",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Submission Failed",
        description: error.message || 'Could not submit quote',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Basic client-side validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG, PNG, or WEBP image",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center" 
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/70" />
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6 overflow-visible"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create Quote for: <span className="text-blue-600">{part.partName}</span></h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {part.quoteRange && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span className="text-sm text-blue-800">Quote Range: </span>
              <span className="font-bold text-blue-800">
                AED {part.quoteRange.min} - {part.quoteRange.max}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Price (AED) *</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Condition</label>
            <Select 
              value={condition}
              onValueChange={(value: QuoteCondition) => setCondition(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[300]">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                <SelectItem value="Used - Good">Used - Good</SelectItem>
                <SelectItem value="Used - Fair">Used - Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Warranty</label>
            <Select 
              value={warranty}
              onValueChange={(value: QuoteWarranty) => setWarranty(value)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select warranty" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[300]">
                <SelectItem value="No Warranty">No Warranty</SelectItem>
                <SelectItem value="3 Days">3 Days</SelectItem>
                <SelectItem value="7 Days">7 Days</SelectItem>
                <SelectItem value="14 Days">14 Days</SelectItem>
                <SelectItem value="30 Days">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto h-24 w-auto rounded-md object-cover" 
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || !price}
          >
            {isSubmitting ? "Submitting..." : "Submit Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const toast = ({ title, description, variant }: { title: string; description: string; variant: string }) => {
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
};
