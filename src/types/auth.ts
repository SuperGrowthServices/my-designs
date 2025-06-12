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

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string, 
    password: string, 
    fullName: string, 
    whatsappNumber: string, 
    location: string
  ) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
}
