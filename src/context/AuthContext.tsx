import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { signUp, signIn, signOut } from "@/lib/supabase/auth";
import { AuthUser, AuthContextType, AuthResponse } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use the auth context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication context provider
 * Manages global authentication state for the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user with database
  const syncUserWithDatabase = async (session: Session | null) => {
    if (!session) return;

    try {
      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Failed to sync user with database:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error syncing user with database:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          setSession(session);
          setUser((session?.user as AuthUser) || null);

          // Sync user with database if signed in
          if (session) {
            await syncUserWithDatabase(session);
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser((session?.user as AuthUser) || null);

      // Sync user with database on sign in or token refresh
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        await syncUserWithDatabase(session);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResponse> => {
    const result = await signUp(email, password, fullName);

    // If signup was successful and we have a session, sync with database
    if (result.user && !result.error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await syncUserWithDatabase(session);
      }
    }

    return result;
  };

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const result = await signIn(email, password);

    // If signin was successful and we have a session, sync with database
    if (result.user && !result.error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await syncUserWithDatabase(session);
      }
    }

    return result;
  };

  const handleSignOut = async (): Promise<{ error: string | null }> => {
    return await signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
