export interface Order {
  id: string;
  created_at: string;
  user_id: string;
  status: 'open' | 'partial' | 'closed' | 'cancelled' | 'refunded' | 'ready_for_checkout' | 'completed';
  is_paid?: boolean;
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
  year: number;
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

export interface OrderWithParts extends Order {
  parts: Part[];
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