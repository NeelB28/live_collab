import { User, Session } from "@supabase/supabase-js";

/**
 * Extended User interface for LiveCollab with additional metadata
 */
export interface AuthUser extends User {
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Authentication context interface
 */
export interface AuthContextType extends AuthState {
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: string | null }>;
  clearError?: () => void;
}

/**
 * Sign up form data interface
 */
export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Sign in form data interface
 */
export interface SignInFormData {
  email: string;
  password: string;
}
