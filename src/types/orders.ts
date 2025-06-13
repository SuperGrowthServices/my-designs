export interface Order {
  id: string;
  created_at: string;
  user_id: string;
  status: 'open' | 'partial' | 'closed' | 'cancelled' | 'refunded' | 'ready_for_checkout' | 'completed';
  is_paid?: boolean;
}

// Rename the second interface to avoid conflict
export interface OrderWithPartsResponse {
  id: string;
  created_at: string;
  parts: Array<{
    id: string;
    part_name: string;
    part_number: string | null;
    quantity: number;
    vehicle: DBVehicle;
    existing_bid?: Bid;
    bids?: Bid[];
  }>;
}

// Keep the original OrderWithParts interface
export interface OrderWithParts extends Order {
  parts: Part[];
}

export interface Part {
  id: string;
  order_id: string;
  part_name: string;
  description?: string;
  part_number?: string;
  quantity: number;
  vehicle_id?: string;
  vehicle?: Vehicle;
  bids: Bid[];
  existing_bid?: Bid;
  total_bids?: number;
  has_accepted_bid?: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string | number; // Modified this line
  vin?: string; // Add this line
}

export interface Bid {
  id: string;
  created_at: string;
  updated_at: string;
  vendor_id: string;
  part_id: string;
  price: number;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  image_url: string | null;
  shipped_at: string | null;
}

// Database response types
export interface BidResponse {
  id: string;
  created_at: string;
  updated_at: string;
  vendor_id: string;
  part_id: string;
  price: number;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  image_url: string | null;
  shipped_at: string | null;
}

export interface PartResponse {
  id: string;
  order_id: string;
  part_name: string;
  description?: string;
  part_number?: string;
  quantity: number;
  vehicle_id?: string;
  vehicle?: Vehicle;
  bids: BidResponse[];
  existing_bid?: BidResponse;
  total_bids?: number;
  has_accepted_bid?: boolean;
}

export type QuoteCondition = 'New' | 'Used - Excellent' | 'Used - Good' | 'Used - Fair';
export type QuoteWarranty = 'No Warranty' | '3 Days' | '7 Days' | '14 Days' | '30 Days';

export interface QuoteRange {
  min: number;
  max: number;
}

export interface MyQuote {
  id: string;
  price: number;
  condition: QuoteCondition;
  warranty: QuoteWarranty;
  notes?: string;
  imageUrl?: string;
  isAccepted: boolean;
}

export interface DBVehicle extends Vehicle {
  vin: string | null;
  created_at: string;
  updated_at: string;
}