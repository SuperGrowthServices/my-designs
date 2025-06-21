export interface Vehicle {
  make: string;
  model: string;
  year: string;
  vin: string;
}

export interface PartRequest {
  part_name: string;
  part_number?: string;
  condition: 'New' | 'Used' | 'Refurbished';
  warranty: string;
  quantity: number;
  notes?: string;
  estimated_budget?: string;
} 