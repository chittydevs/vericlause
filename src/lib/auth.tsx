import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

type User = {
  id: string;
  email?: string;
};

type Role = "admin" | "user" | null;

type AuthContextValue = {
  user: User | null;
  role: Role;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to load role from "users" table based on auth user id
  const loadUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to load user role:", error.message);
      setRole(null);
      return;
    }

    setRole((data?.role as Role) ?? null);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      
      // Handle OAuth callback if present
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        const authUser: User = {
          id: session.user.id,
          email: session.user.email ?? undefined,
        };
        setUser(authUser);
        await loadUserRole(session.user.id);
        
        // Redirect after OAuth login
        if (accessToken) {
          const currentRole = await (async () => {
            const { data } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .single();
            return (data?.role as Role) ?? null;
          })();
          redirectAfterLogin(currentRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    void init();

    const {
      data: subscription,
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const authUser: User = {
          id: session.user.id,
          email: session.user.email ?? undefined,
        };
        setUser(authUser);
        const userRole = await (async () => {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();
          return (data?.role as Role) ?? null;
        })();
        setRole(userRole);
        
        // Handle redirect after OAuth sign-in
        if (event === 'SIGNED_IN') {
          redirectAfterLogin(userRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const redirectAfterLogin = (nextRole: Role) => {
    if (nextRole === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const sessionUser = data.user;
    if (!sessionUser) {
      throw new Error("No user returned from Supabase.");
    }

    const authUser: User = {
      id: sessionUser.id,
      email: sessionUser.email ?? undefined,
    };
    setUser(authUser);
    
    // Load role and then redirect
    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", sessionUser.id)
      .single();
    
    const userRole = (roleData?.role as Role) ?? null;
    setRole(userRole);
    redirectAfterLogin(userRole);
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error(error.message || 'Failed to initiate Google sign-in. Please ensure Google OAuth is configured in your Supabase project.');
    }
    
    // The redirect will happen automatically, onAuthStateChange will handle the rest
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setRole(null);
    navigate("/login", { replace: true });
  };

  const value: AuthContextValue = {
    user,
    role,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

