// Supabase authentication utilities

import { supabase } from "./client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string;
    name?: string;
  };
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
  loading: boolean;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  fullName?: string
) => {
  try {
    console.log("🔍 Attempting signup with:", {
      email,
      hasPassword: !!password,
      fullName,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    });

    console.log("📊 Signup response:", { data, error });

    if (error) {
      console.error("❌ Signup error details:", {
        message: error.message,
        status: error.status,
        statusText: error.message || "No status text",
      });
      throw error;
    }

    return {
      user: data.user as AuthUser,
      error: null,
      loading: false,
    };
  } catch (error) {
    console.error("🚨 Signup catch block:", error);
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
      loading: false,
    };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user as AuthUser,
      error: null,
      loading: false,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
      loading: false,
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Get the current user session
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return {
      user: user as AuthUser,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
