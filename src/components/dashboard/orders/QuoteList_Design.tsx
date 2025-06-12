import React from 'react';
import { Button } from '@/components/ui/button';
import { Part, Quote } from '@/data/mockDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ShieldCheck, Wrench } from 'lucide-react';

interface QuoteList_DesignProps {
    part: Part | null;
    onAcceptQuote: (partId: string, quoteId: string) => void;
}

export const QuoteList_Design: React.FC<QuoteList_DesignProps> = ({ part, onAcceptQuote }) => {
    if (!part) return null;

    // This component now ONLY renders the list, not the modal container.
    // The modal container is handled by `QuoteReviewModal` in OrderCard_Design.tsx
    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {part.quotes.map((quote, index) => (
                <div key={index} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow">
                        <p className="font-bold text-lg">{`Quote ${index + 1}`}</p>
                        <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                                <Wrench className="h-4 w-4" />
                                <span>{quote.condition}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" />
                                <span>{quote.warranty} Warranty</span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-3">
                            {quote.notes && (
                                <div className="text-sm bg-gray-50 p-3 rounded-md border flex-grow">
                                    <p className="font-semibold mb-1">Vendor Notes:</p>
                                    <p className="text-muted-foreground">{quote.notes}</p>
                                </div>
                            )}
                            {quote.imageUrl && (
                                <div className="flex-shrink-0">
                                    <p className="font-semibold mb-1 text-sm">Image</p>
                                    <img src={quote.imageUrl} alt="Vendor quote" className="h-20 w-20 object-cover rounded-md border" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <Badge variant="outline" className="text-2xl font-bold p-2 px-4 border-green-600 text-green-700 bg-green-50 mb-2">
                            AED {quote.price}
                        </Badge>
                        <Button className="w-full sm:w-auto" onClick={() => onAcceptQuote(part.id, quote.id)}>
                            <Check className="mr-2 h-4 w-4" /> Accept Quote & Add to Cart
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
} 