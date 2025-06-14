import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2 } from "lucide-react";
import {
    VendorPart,
    MyQuote,
    QuoteCondition,
    QuoteWarranty,
} from "@/types/vendor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// --- Update/View Quote Modal ---
export const QuotedPartForm = ({
    part,
    onUpdate,
    onRemove,
    mode,
}: {
    part: VendorPart;
    onUpdate: (partId: string, updatedQuote: MyQuote) => Promise<void>;
    onRemove: (partId: string) => Promise<void>;
    mode: "update" | "view";
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const quote = part.myQuote;
    if (!quote) return null;

    const [price, setPrice] = useState(quote.price.toString());
    const [condition, setCondition] = useState<QuoteCondition>(quote.condition);
    const [warranty, setWarranty] = useState<QuoteWarranty>(quote.warranty);
    const [notes, setNotes] = useState(quote.notes || "");
    const [imagePreview, setImagePreview] = useState<string | null>(
        quote.imageUrl || null
    );

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            // Validate file
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast({
                    title: "Error",
                    description: "Image must be less than 5MB",
                    variant: "destructive",
                });
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        try {
            setIsSubmitting(true);
            let imageUrl = quote.imageUrl;

            // Handle new image upload
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${user?.id}_${part.id}_${Date.now()}.${fileExt}`;
                const filePath = `quotes/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("quotes")
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("quotes")
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
            }

            const updatedQuote: MyQuote = {
                ...quote,
                price: parseFloat(price) || 0,
                condition,
                warranty,
                notes,
                imageUrl,
            };

            await onUpdate(part.id, updatedQuote);

            toast({
                title: "Success",
                description: "Quote updated successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update quote",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = () => {
        onRemove(part.id);
    };

    // Read-only view for accepted quotes or when in 'view' mode
    if (quote.isAccepted || mode === "view") {
        return (
            <div
                className={`p-4 rounded-b-lg ${
                    quote.isAccepted ? "bg-green-50" : "bg-gray-50"
                }`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="md:col-span-1 space-y-4">
                        <div>
                            <p className="text-gray-500">Price</p>
                            <p className="font-medium">AED {quote.price}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Condition</p>
                            <p className="font-medium">{quote.condition}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Warranty</p>
                            <p className="font-medium">{quote.warranty}</p>
                        </div>
                    </div>
                    {quote.imageUrl && (
                        <div className="md:col-span-1">
                            <p className="text-gray-500 mb-1">Image</p>
                            <img
                                src={quote.imageUrl}
                                alt="Part image"
                                className="rounded-lg w-full h-auto max-h-32 object-cover border"
                            />
                        </div>
                    )}
                </div>
                {quote.notes && (
                    <div className="mt-3">
                        <p className="text-gray-500 text-sm">Notes</p>
                        <p className="text-sm font-medium">{quote.notes}</p>
                    </div>
                )}
            </div>
        );
    }

    // Editable form for pending quotes
    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">
                            Your Price (AED)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g., 450"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Select
                            onValueChange={(v: QuoteCondition) => setCondition(v)}
                            defaultValue={condition}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                className="z-[300]"
                                side="bottom"
                                align="start"
                            >
                                <SelectItem value="Used - Excellent">
                                    Used - Excellent
                                </SelectItem>
                                <SelectItem value="Used - Good">
                                    Used - Good
                                </SelectItem>
                                <SelectItem value="Used - Fair">
                                    Used - Fair
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Warranty</label>
                        <Select
                            onValueChange={(v: QuoteWarranty) => setWarranty(v)}
                            defaultValue={warranty}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                className="z-[300]"
                                side="bottom"
                                align="start"
                            >
                                <SelectItem value="No Warranty">
                                    No Warranty
                                </SelectItem>
                                <SelectItem value="3 Days">3 Days</SelectItem>
                                <SelectItem value="7 Days">7 Days</SelectItem>
                                <SelectItem value="14 Days">14 Days</SelectItem>
                                <SelectItem value="30 Days">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">
                        Image (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mx-auto h-24 w-auto rounded-md object-cover"
                                />
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file-upload-update"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Change image</span>
                                    <input
                                        id="file-upload-update"
                                        name="file-upload-update"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => setImagePreview(null)}
                                    className="text-xs text-red-600 hover:text-red-800 flex items-center justify-center gap-1 mx-auto">
                                    <Trash2 className="h-3 w-3" /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">
                    Description / Notes (Optional)
                </label>
                <Textarea
                    placeholder="Add any extra details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex gap-2 pt-2">
                <Button
                    onClick={handleRemove}
                    variant="destructive"
                    size="sm"
                    className="flex-1">
                    Remove Quote
                </Button>
                <Button
                    onClick={handleUpdate}
                    variant="default"
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}>
                    Update Quote
                </Button>
            </div>
        </div>
    );
};
