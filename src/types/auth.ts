
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, whatsappNumber: string, location: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export interface UserMetadata {
  full_name?: string;
  name?: string;
  whatsapp_number?: string;
  phone?: string;
  location?: string;
  business_name?: string;
}
