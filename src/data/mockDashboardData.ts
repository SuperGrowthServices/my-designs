export interface Quote {
  id: string;
  vendorName: string;
  vendorRating: number;
  price: number;
  condition: 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
  warranty: 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days';
  notes?: string;
  imageUrl?: string;
}

export interface Part {
  id: string;
  partName: string;
  status: 'PENDING_QUOTES' | 'QUOTES_RECEIVED' | 'QUOTE_ACCEPTED';
  quotes: Quote[];
}

export interface Vehicle {
  id: string;
  vehicleName: string; // e.g., "Toyota Camry 2021"
  parts: Part[];
}

export interface Order {
  id: string;
  orderId: string;
  status: 'LIVE' | 'PARTIALLY_ACCEPTED' | 'NEW' | 'COMPLETED_ARCHIVED';
  vehicles: Vehicle[];
}

const generateQuotes = (count: number): Quote[] => {
    const quotes: Quote[] = [];
    const conditions: Quote['condition'][] = ['Used - Excellent', 'Used - Good', 'Used - Fair'];
    const warranties: Quote['warranty'][] = ['No Warranty', '7 Days', '14 Days', '30 Days'];
    const sampleImages = [
        'https://i.imgur.com/8Q6tW83.jpeg',
        'https://i.imgur.com/sC9AnpD.jpeg',
    ];

    for (let i = 0; i < count; i++) {
        const hasNote = Math.random() > 0.5;
        const hasImage = Math.random() > 0.5;
        quotes.push({
            id: `quote-${Math.random()}`,
            vendorName: `Quote ${i + 1}`, // Anonymized vendor name
            vendorRating: +(4 + Math.random()).toFixed(1),
            price: Math.floor(Math.random() * 350) + 50,
            condition: conditions[i % conditions.length],
            warranty: warranties[i % warranties.length],
            ...(hasNote && { notes: `This is a sample note for quote ${i + 1}. Includes extra details about the part condition and history.` }),
            ...(hasImage && { imageUrl: sampleImages[i % sampleImages.length] })
        });
    }
    return quotes;
}

export const mockDashboardData: Order[] = [
    // Scenario 1: The Simple Case
    {
        id: 'order-1',
        orderId: '#12345',
        status: 'LIVE',
        vehicles: [
            {
                id: 'vehicle-1',
                vehicleName: 'Toyota Camry 2021',
                parts: [
                    { id: 'part-1a', partName: 'Left Headlight Assembly', status: 'QUOTES_RECEIVED', quotes: generateQuotes(3) },
                    { id: 'part-1b', partName: 'Front Bumper', status: 'PENDING_QUOTES', quotes: [] },
                ]
            }
        ]
    },
    // Scenario 2: The Multi-Vehicle Order
    {
        id: 'order-2',
        orderId: '#12346',
        status: 'LIVE',
        vehicles: [
            {
                id: 'vehicle-2a',
                vehicleName: 'Ford F-150 2020',
                parts: [
                    { id: 'part-2a1', partName: 'Radiator', status: 'QUOTES_RECEIVED', quotes: generateQuotes(1) },
                ]
            },
            {
                id: 'vehicle-2b',
                vehicleName: 'Honda Accord 2019',
                parts: [
                    { id: 'part-2b1', partName: 'Alternator', status: 'QUOTES_RECEIVED', quotes: generateQuotes(4) },
                    { id: 'part-2b2', partName: 'Brake Pads (Front)', status: 'PENDING_QUOTES', quotes: [] },
                ]
            },
            {
                id: 'vehicle-2c',
                vehicleName: 'Tesla Model 3 2022',
                parts: [
                    { id: 'part-2c1', partName: 'Charge Port Door', status: 'PENDING_QUOTES', quotes: [] },
                ]
            }
        ]
    },
    // Scenario 3: The Brand New Order
    {
        id: 'order-3',
        orderId: '#12347',
        status: 'NEW',
        vehicles: [
            {
                id: 'vehicle-3',
                vehicleName: 'Nissan Patrol 2023',
                parts: [
                    { id: 'part-3a', partName: 'Windshield', status: 'PENDING_QUOTES', quotes: [] },
                    { id: 'part-3b', partName: 'Air Filter', status: 'PENDING_QUOTES', quotes: [] },
                ]
            }
        ]
    },
    // Scenario 4: Heavy Quoting
    {
        id: 'order-4',
        orderId: '#12348',
        status: 'LIVE',
        vehicles: [
            {
                id: 'vehicle-4',
                vehicleName: 'Mercedes G-Wagon 2022',
                parts: [
                    { id: 'part-4a', partName: 'Exhaust System', status: 'QUOTES_RECEIVED', quotes: generateQuotes(12) },
                ]
            }
        ]
    },
    // Scenario 5: The Partially Accepted Order
    {
        id: 'order-5',
        orderId: '#12349',
        status: 'PARTIALLY_ACCEPTED',
        vehicles: [
            {
                id: 'vehicle-5',
                vehicleName: 'BMW X5 2018',
                parts: [
                    { id: 'part-5a', partName: 'Water Pump', status: 'QUOTE_ACCEPTED', quotes: generateQuotes(5) },
                    { id: 'part-5b', partName: 'Timing Belt', status: 'QUOTES_RECEIVED', quotes: generateQuotes(2) },
                    { id: 'part-5c', partName: 'Oxygen Sensor', status: 'PENDING_QUOTES', quotes: [] },
                    { id: 'part-5d', partName: 'Spark Plugs', status: 'QUOTES_RECEIVED', quotes: generateQuotes(3) },
                    { id: 'part-5e', partName: 'Ignition Coil', status: 'PENDING_QUOTES', quotes: [] },
                ]
            }
        ]
    }
]; 