import React, { useState } from 'react';
import { VendorOrder, VendorPart, MyQuote, QuoteCondition, QuoteWarranty } from '@/data/mockVendorData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Trash2 } from 'lucide-react';

// --- Create Quote Modal ---
const CreateQuoteModal_Design = ({ part, orderId, onClose, onAddQuote }: { part: VendorPart | null; orderId: string; onClose: () => void; onAddQuote: (orderId: string, partId: string, newQuote: MyQuote) => void }) => {
    if (!part) return null;
    
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState<QuoteCondition>('Used - Good');
    const [warranty, setWarranty] = useState<QuoteWarranty>('7 Days');
    const [notes, setNotes] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = () => {
        const newQuote: MyQuote = {
            id: `mq-${Math.random()}`,
            price: parseFloat(price) || 0,
            condition,
            warranty,
            notes,
            imageUrl: imagePreview || undefined,
            isAccepted: false,
        };
        onAddQuote(orderId, part.id, newQuote);
        onClose(); // Close this modal, which will also close the parent.
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // In a real app, you'd upload this file to a server and get back a URL.
            // For this design sandbox, we'll use the local object URL for a preview.
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md m-4">
                <h3 className="text-xl font-bold">Create Quote for: <span className="text-blue-600">{part.partName}</span></h3>
                <p className="text-sm text-gray-500 mb-4">Part Number: {part.partNumber}</p>

                {part.quoteRange && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <span className="text-sm text-blue-800">Current Quote Range: </span>
                        <span className="font-bold text-blue-800">AED {part.quoteRange.min} - {part.quoteRange.max}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Your Price (AED)</label>
                        <Input type="number" placeholder="e.g., 450" value={price} onChange={e => setPrice(e.target.value)} className="focus:ring-2 focus:ring-blue-500"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Image (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-cover" />
                                ) : (
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Select onValueChange={(v: QuoteCondition) => setCondition(v)} defaultValue={condition}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                                <SelectItem value="Used - Good">Used - Good</SelectItem>
                                <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Warranty</label>
                        <Select onValueChange={(v: QuoteWarranty) => setWarranty(v)} defaultValue={warranty}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No Warranty">No Warranty</SelectItem>
                                <SelectItem value="3 Days">3 Days</SelectItem>
                                <SelectItem value="7 Days">7 Days</SelectItem>
                                <SelectItem value="14 Days">14 Days</SelectItem>
                                <SelectItem value="30 Days">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description / Notes (Optional)</label>
                        <Textarea placeholder="Add any extra details..." value={notes} onChange={e => setNotes(e.target.value)} className="focus:ring-2 focus:ring-blue-500"/>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button onClick={onClose} variant="outline" className="w-full">Cancel</Button>
                    <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">Submit Quote</Button>
                </div>
            </div>
        </div>
    );
};


// --- Order Details Modal ---
export const OrderDetailsModal_Design = ({ order, onClose, onAddQuote }: { order: VendorOrder | null, onClose: () => void, onAddQuote: (orderId: string, partId: string, newQuote: MyQuote) => void }) => {
    if (!order) return null;
    const [quotePart, setQuotePart] = useState<VendorPart | null>(null);

    const handleOpenQuoteModal = (part: VendorPart) => {
        setQuotePart(part);
    };

    const handleCloseAll = () => {
        setQuotePart(null);
        onClose();
    };
    
    return (
        <div onClick={handleCloseAll} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Quote Request: <span className="text-blue-600">{order.orderId}</span></h2>
                        <Button onClick={handleCloseAll} variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {order.vehicles.map(vehicle => (
                        <div key={vehicle.id} className="bg-slate-50 rounded-lg overflow-hidden border">
                            <div className="p-4 bg-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">{vehicle.vehicleName}</h3>
                                <p className="text-sm text-slate-500 font-mono">VIN: {vehicle.vinNumber}</p>
                            </div>
                            <div className="p-4 space-y-3">
                                {vehicle.parts.map(part => (
                                    <div key={part.id} className="p-3 bg-white rounded-lg border flex justify-between items-center">
                                        <div className="flex-grow">
                                            <p className="font-semibold">{part.partName}</p>
                                            <div className="flex items-center gap-x-4 text-sm text-gray-600 mt-1">
                                                <span className="font-mono">Part #: {part.partNumber}</span>
                                                <Badge variant="secondary">Qty: {part.quantity}</Badge>
                                            </div>
                                            {part.quoteRange && (
                                                <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 border-l-4 border-blue-300">
                                                    <span>Quote Range from other vendors: </span>
                                                    <span className="font-semibold text-gray-800">AED {part.quoteRange.min} - {part.quoteRange.max}</span>
                                                </div>
                                            )}
                                            {part.additionalInfo && (
                                                <Accordion type="single" collapsible className="w-full mt-2">
                                                    <AccordionItem value="item-1" className="border-none">
                                                        <AccordionTrigger className="text-xs py-1 text-blue-600 hover:no-underline">View Additional Information</AccordionTrigger>
                                                        <AccordionContent className="text-sm p-2 bg-white rounded">
                                                            {part.additionalInfo}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            )}
                                        </div>
                                        <Button onClick={() => handleOpenQuoteModal(part)} className="bg-blue-600 hover:bg-blue-700">Quote</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* The second modal is rendered on top */}
            <CreateQuoteModal_Design part={quotePart} orderId={order.id} onClose={() => setQuotePart(null)} onAddQuote={onAddQuote}/>
        </div>
    );
};


// --- Update/View Quote Modal ---
const QuotedPartForm = ({ part, onUpdate, onRemove, mode }: { part: VendorPart; onUpdate: (partId: string, updatedQuote: MyQuote) => void; onRemove: (partId: string) => void; mode: 'update' | 'view' }) => {
    const quote = part.myQuote;
    if (!quote) return null;

    const [price, setPrice] = useState(quote.price.toString());
    const [condition, setCondition] = useState<QuoteCondition>(quote.condition);
    const [warranty, setWarranty] = useState<QuoteWarranty>(quote.warranty);
    const [notes, setNotes] = useState(quote.notes || '');
    const [imagePreview, setImagePreview] = useState<string | null>(quote.imageUrl || null);

    const handleUpdate = () => {
        const updatedQuote: MyQuote = {
            ...quote,
            price: parseFloat(price) || 0,
            condition,
            warranty,
            notes,
            imageUrl: imagePreview || undefined,
        };
        onUpdate(part.id, updatedQuote);
    };

    const handleRemove = () => {
        onRemove(part.id);
    }
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Read-only view for accepted quotes or when in 'view' mode
    if (quote.isAccepted || mode === 'view') {
        return (
            <div className={`p-4 rounded-b-lg ${quote.isAccepted ? 'bg-green-50' : 'bg-gray-50'}`}>
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
                            <img src={quote.imageUrl} alt="Part image" className="rounded-lg w-full h-auto max-h-32 object-cover border" />
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
        )
    }

    // Editable form for pending quotes
    return (
         <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-medium">Your Price (AED)</label>
                        <Input type="number" placeholder="e.g., 450" value={price} onChange={e => setPrice(e.target.value)} className="focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Select onValueChange={(v: QuoteCondition) => setCondition(v)} defaultValue={condition}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                                <SelectItem value="Used - Good">Used - Good</SelectItem>
                                <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Warranty</label>
                        <Select onValueChange={(v: QuoteWarranty) => setWarranty(v)} defaultValue={warranty}>
                            <SelectTrigger className="focus:ring-2 focus:ring-blue-500"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No Warranty">No Warranty</SelectItem>
                                <SelectItem value="3 Days">3 Days</SelectItem>
                                <SelectItem value="7 Days">7 Days</SelectItem>
                                <SelectItem value="14 Days">14 Days</SelectItem>
                                <SelectItem value="30 Days">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium">Image (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-cover" />
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload-update" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Change image</span>
                                    <input id="file-upload-update" name="file-upload-update" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                            {imagePreview && (
                                <button type="button" onClick={() => setImagePreview(null)} className="text-xs text-red-600 hover:text-red-800 flex items-center justify-center gap-1 mx-auto">
                                    <Trash2 className="h-3 w-3" /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">Description / Notes (Optional)</label>
                <Textarea placeholder="Add any extra details..." value={notes} onChange={e => setNotes(e.target.value)} className="focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="flex gap-2 pt-2">
                <Button onClick={handleRemove} variant="destructive" size="sm" className="flex-1">Remove Quote</Button>
                <Button onClick={handleUpdate} variant="default" size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Update Quote</Button>
            </div>
         </div>
    )
}

export const UpdateQuoteModal_Design = ({ order, onClose, mode }: { order: VendorOrder | null; onClose: () => void; mode: 'update' | 'view' }) => {
    if (!order) return null;

    // TODO: Connect these to the main state updater function
    const handleUpdateQuote = (partId: string, updatedQuote: MyQuote) => {
        console.log(`Updating quote for part ${partId}`, updatedQuote);
        alert(`Design Mode: Quote for part ${partId} updated!`);
        onClose(); 
    };

    const handleRemoveQuote = (partId: string) => {
        console.log(`Removing quote for part ${partId}`);
        alert(`Design Mode: Quote for part ${partId} removed!`);
        onClose();
    };

    const myQuotedParts = order.vehicles.flatMap(vehicle => 
        vehicle.parts
            .filter(part => mode === 'view' ? part.myQuote?.isAccepted : part.myQuote)
            .map(part => ({ ...part, vehicleId: vehicle.id }))
    );
    
    return (
         <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                 <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Your Quote for Order: <span className="text-blue-600">{order.orderId}</span></h2>
                        <Button onClick={onClose} variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                 </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {order.vehicles.map(vehicle => {
                        const vehicleParts = myQuotedParts.filter(p => p.vehicleId === vehicle.id);
                        if(vehicleParts.length === 0) return null;

                        return (
                            <div key={vehicle.id} className="bg-slate-50 rounded-lg overflow-hidden border">
                                <div className="p-4 bg-slate-100">
                                    <h3 className="font-bold text-lg text-slate-800">{vehicle.vehicleName}</h3>
                                    <p className="text-sm text-slate-500 font-mono">VIN: {vehicle.vinNumber}</p>
                                </div>
                                <Accordion type="single" collapsible className="w-full space-y-2 p-4">
                                    {vehicleParts.map(part => (
                                         <AccordionItem value={part.id} key={part.id} className="border rounded-lg shadow-sm bg-white">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-lg">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="text-left">
                                                        <p className="font-semibold">{part.partName}</p>
                                                        <p className="text-sm font-mono text-gray-500">Part #: {part.partNumber}</p>
                                                    </div>
                                                     <div className="flex items-center gap-x-3">
                                                        {part.myQuote?.imageUrl && <img src={part.myQuote.imageUrl} className="h-8 w-8 rounded-sm object-cover border" />}
                                                        {part.myQuote?.isAccepted 
                                                            ? <Badge className={'bg-green-100 text-green-800'}>Accepted</Badge>
                                                            : (
                                                                <div className="text-right">
                                                                    <span className="text-blue-600 font-semibold">AED {part.myQuote?.price}</span>
                                                                    {part.quoteRange && (
                                                                        <p className="text-xs text-gray-500">
                                                                            Market: {part.quoteRange.min}-{part.quoteRange.max}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        }
                                                     </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-1 pb-1">
                                                <QuotedPartForm key={part.id} part={part} onUpdate={handleUpdateQuote} onRemove={handleRemoveQuote} mode={mode} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}; 