import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'buyer' | 'vendor' | 'admin' | 'driver';

export interface SignUpData {
  email: string;
  password: string;
  userData: {
    full_name: string;
    whatsapp_number: string;
    location: string;
    role: UserRole;
    business_name?: string;
    vendor_tags?: string[];
    delivery_address?: string;
    delivery_phone?: string;
    delivery_instructions?: string;
    google_maps_url?: string;
  };
}

export interface AuthResult {
  data: {
    user: SupabaseUser;
    session: Session;
  } | null;
  error: Error | null;
}

export interface SignInResponse extends AuthResult {
  role?: UserRole;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  whatsapp_number: string;
  location: string;
  address: string;
  google_maps_link: string;
  created_at: string;
  roles: string[];
  status: 'active' | 'disabled';
  vehicleMakes: string[];
  referred_by: string;
}
