export type QuoteCondition = "Used - Excellent" | "Used - Good" | "Used - Fair";
export type QuoteWarranty = "No Warranty" | "3 Days" | "7 Days" | "14 Days" | "30 Days";

// Represents a quote from the perspective of the current vendor
export interface MyQuote {
    id: string;
    price: number;
    condition: QuoteCondition;
    warranty: QuoteWarranty;
    notes?: string;
    imageUrl?: string;
    isAccepted: boolean;
}

// Represents a single part within an order
export interface VendorPart {
    id: string;
    partName: string;
    partNumber: string;
    quantity: number;
    additionalInfo?: string;
    myQuote?: MyQuote; // The current vendor's quote on this part, if it exists
    quoteRange?: { // The min-max range from OTHER vendors
        min: number;
        max: number;
    };
}

// Represents a vehicle within an order
export interface VendorVehicle {
    id: string;
    vehicleName: string;
    vinNumber: string;
    parts: VendorPart[];
}

// Represents an entire order from a parts request
export interface VendorOrder {
    id: string;
    orderId: string; // The user-facing order ID e.g., #12345
    createdAt: string;
    vehicles: VendorVehicle[];
}

// --- MOCK DATA GENERATION ---

export const mockVendorData: VendorOrder[] = [
    // SCENARIO 1: A brand new order with multiple vehicles the vendor hasn't touched yet.
    {
        id: 'vq-order-1',
        orderId: '#2001',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        vehicles: [
            {
                id: 'vq-v-1a',
                vehicleName: 'Toyota Land Cruiser 2022',
                vinNumber: 'JTECDA3FX12345678',
                parts: [
                    { id: 'vq-p-1a1', partName: 'Front Grille', partNumber: '53101-60B50', quantity: 1, quoteRange: { min: 800, max: 950 } },
                    { id: 'vq-p-1a2', partName: 'Side Mirror (Right)', partNumber: '87910-60N10', quantity: 1, additionalInfo: 'Customer mentions the mirror housing is cracked but the glass is intact.' },
                ]
            },
            {
                id: 'vq-v-1b',
                vehicleName: 'Lexus LX570 2021',
                vinNumber: 'JTJHY7AX8K9012345',
                parts: [
                    { id: 'vq-p-1b1', partName: 'Tail Light Assembly (Left)', partNumber: '81561-60C30', quantity: 1 },
                ]
            }
        ]
    },
    // SCENARIO 2: A partially quoted order with competing quotes shown.
    {
        id: 'vq-order-2',
        orderId: '#2002',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        vehicles: [
            {
                id: 'vq-v-2a',
                vehicleName: 'Nissan Patrol Y62 2023',
                vinNumber: 'JN8AS5FW8P4567890',
                parts: [
                    {
                        id: 'vq-p-2a1', partName: 'Infotainment Screen', partNumber: '2591A-6CA0A', quantity: 1,
                        myQuote: { id: 'mq-1', price: 1200, condition: 'Used - Excellent', warranty: '14 Days', isAccepted: false },
                        quoteRange: { min: 1150, max: 1350 }
                    },
                    {
                        id: 'vq-p-2a2', partName: 'Steering Wheel Clock Spring', partNumber: 'B5567-JG49D', quantity: 1,
                        myQuote: { id: 'mq-1b', price: 275, condition: 'Used - Good', warranty: '7 Days', isAccepted: false },
                        quoteRange: { min: 250, max: 300 }
                    },
                ]
            }
        ]
    },
    // SCENARIO 3: An order where my quote has been accepted.
    {
        id: 'vq-order-3',
        orderId: '#2003',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        vehicles: [
            {
                id: 'vq-v-3a',
                vehicleName: 'Chevrolet Tahoe 2019',
                vinNumber: '1GNSKBKC7KR123456',
                parts: [
                    {
                        id: 'vq-p-3a1', partName: 'Fuel Pump Module', partNumber: 'MU2107', quantity: 1,
                        myQuote: { id: 'mq-2', price: 450, condition: 'Used - Good', warranty: '7 Days', isAccepted: true, imageUrl: 'https://i.imgur.com/8Q6tW83.jpeg' },
                        quoteRange: { min: 420, max: 550 }
                    },
                     {
                        id: 'vq-p-3a2', partName: 'AC Compressor', partNumber: '15-22340', quantity: 1,
                        // This part is on the same order, but my quote was NOT accepted. Someone else's was.
                        // From my perspective, it's just a part I quoted on.
                        myQuote: { id: 'mq-3', price: 700, condition: 'Used - Excellent', warranty: '14 Days', isAccepted: false },
                        quoteRange: { min: 650, max: 750 }
                    }
                ]
            }
        ]
    },
    // SCENARIO 4: An older, fully quoted order to populate the "My Quotes" list.
    {
        id: 'vq-order-4',
        orderId: '#2004',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        vehicles: [
            {
                id: 'vq-v-4a',
                vehicleName: 'Ford Explorer 2020',
                vinNumber: '1FM5K8D83LGA78901',
                parts: [
                    {
                        id: 'vq-p-4a1', partName: 'Front Left CV Axle', partNumber: 'GL1Z-3B437-A', quantity: 1,
                        myQuote: { id: 'mq-4', price: 380, condition: 'Used - Good', warranty: '7 Days', isAccepted: false },
                        quoteRange: { min: 350, max: 420 }
                    }
                ]
            }
        ]
    },
    // SCENARIO 5: A multi-vehicle order with mixed statuses to test all tabs
    {
        id: 'vq-order-5',
        orderId: '#2005',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        vehicles: [
            {
                id: 'vq-v-5a',
                vehicleName: 'BMW 7 Series 2021',
                vinNumber: 'WBA7G0C03MCH12345',
                parts: [
                    {
                        id: 'vq-p-5a1', partName: 'Air Suspension Compressor', partNumber: '37206875176', quantity: 1,
                        myQuote: { id: 'mq-5', price: 1500, condition: 'Used - Excellent', warranty: '30 Days', isAccepted: false, imageUrl: 'https://i.imgur.com/8Q6tW83.jpeg' },
                        quoteRange: { min: 1400, max: 1650 }
                    },
                    { 
                        id: 'vq-p-5a2', partName: 'Control Arm (Front, Lower, Left)', partNumber: '31126863333', quantity: 1,
                        myQuote: { id: 'mq-8', price: 450, condition: 'Used - Good', warranty: '7 Days', isAccepted: false, imageUrl: 'https://i.imgur.com/sC9AnpD.jpeg' },
                    } // New part
                ]
            },
            {
                id: 'vq-v-5b',
                vehicleName: 'Mercedes-Benz S-Class 2022',
                vinNumber: 'WDD2231711A098765',
                parts: [
                     { id: 'vq-p-5b1', partName: 'Digital Light Headlamp (Right)', partNumber: 'A2239067802', quantity: 1 } // New part
                ]
            }
        ]
    },
     // SCENARIO 6: An order where another one of my quotes was accepted, plus a new part on the same vehicle.
    {
        id: 'vq-order-6',
        orderId: '#2006',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        vehicles: [
            {
                id: 'vq-v-6a',
                vehicleName: 'Porsche Cayenne 2020',
                vinNumber: 'WP1AG2A57KLA65432',
                parts: [
                    {
                        id: 'vq-p-6a1', partName: 'Transfer Case Motor', partNumber: '95834130320', quantity: 1,
                        myQuote: { id: 'mq-6', price: 1100, condition: 'Used - Excellent', warranty: '14 Days', isAccepted: true, imageUrl: 'https://i.imgur.com/sC9AnpD.jpeg' },
                        quoteRange: { min: 1000, max: 1200 }
                    },
                    { id: 'vq-p-6a2', partName: 'Brake Booster', partNumber: '95835502352', quantity: 1 } // New part
                ]
            }
        ]
    },
    // SCENARIO 7: Another fully quoted vehicle for the 'My Quotes' tab.
    {
        id: 'vq-order-7',
        orderId: '#2007',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        vehicles: [
            {
                id: 'vq-v-7a',
                vehicleName: 'Audi Q7 2021',
                vinNumber: 'WA1VAFGEOMN123456',
                parts: [
                    {
                        id: 'vq-p-7a1', partName: 'Air Suspension Valve Block', partNumber: '4M0616013A', quantity: 1,
                        myQuote: { id: 'mq-7', price: 650, condition: 'Used - Good', warranty: '14 Days', isAccepted: false },
                        quoteRange: { min: 600, max: 700 }
                    }
                ]
            }
        ]
    }
]; 