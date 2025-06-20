import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { signUp, signIn, signOut } from "@/lib/supabase/auth";
import { AuthUser, AuthResponse } from "@/types/auth";

interface UseSupabaseAuthReturn {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: string | null }>;
  clearError: () => void;
}

/**
 * Custom hook for Supabase authentication
 * Manages authentication state and provides auth methods
 */
export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError(error.message);
        } else {
          setSession(session);
          setUser((session?.user as AuthUser) || null);
        }
      } catch (err) {
        console.error("Error in getInitialSession:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser((session?.user as AuthUser) || null);
      setLoading(false);

      // Clear error on successful auth state change
      if (session && error) {
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [error]);

  const handleSignUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<{ error: string | null }> => {
    setError(null);

    try {
      const result = await signOut();
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    session,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    clearError,
  };
};
