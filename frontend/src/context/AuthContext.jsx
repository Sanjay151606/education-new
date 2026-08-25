import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../api/supabaseClient";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.warn("Could not fetch user profile from API:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initial session load
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!mounted) return;
      setSession(initSession);
      if (initSession) {
        fetchProfile().finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // 2. Auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession) {
        await fetchProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await fetchProfile();
    return data;
  };

  const register = async (email, password, full_name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });
    if (error) throw error;
    if (data.session) {
      await fetchProfile();
    }
    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    return data;
  };

  const requestPasswordReset = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const updateProfile = async (updates) => {
    const res = await api.patch("/api/auth/me", updates);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        loginWithGoogle,
        requestPasswordReset,
        updatePassword,
        updateProfile,
        logout,
        refetchProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
