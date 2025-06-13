import { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: Error | null;
}

export interface SignInResponse extends AuthResult {
  role?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  userData: {
    full_name: string;
    whatsapp_number: string;
    location: string;
    role: 'buyer' | 'vendor';
    business_name?: string;
    bank_name?: string;
    bank_iban?: string;
    vendor_tags?: string[];
    application_status?: string;
    application_submitted_at?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
}
