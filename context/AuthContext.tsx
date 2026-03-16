"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Check environment variables.");
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Check for redirect result on mount
    getRedirectResult(auth).catch((error: unknown) => {
      console.error("Redirect auth error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(',') || [];
      setIsAdmin(!!user?.email && adminEmails.includes(user.email));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = async () => {
    if (!auth || isAuthenticating) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsAuthenticating(true);

    if (isMobile) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (error) {
        console.error("Mobile redirect login failed:", error);
        alert("Error al iniciar sesión en móvil. Revisa tu conexión.");
        setIsAuthenticating(false);
      }
      return;
    }

    try {
      // Desktop: Try popup first
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const authError = error as { code?: string };
      
      // Handle benign cancellation errors silenty
      if (authError.code === 'auth/cancelled-popup-request' || 
          authError.code === 'auth/popup-closed-by-user') {
        console.log("Login cancelled by user or multiple requests.");
        return;
      }

      // If popup is blocked, use redirect as fallback
      if (authError.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error("Redirect login fallback failed:", redirectError);
        }
      } else {
        console.error("Login failed:", error);
        if (authError.code === 'auth/unauthorized-domain') {
          alert("Error: Este dominio no está autorizado en Firebase. Añade 'hablar-paja-bc.vercel.app' a Dominios autorizados en la consola de Firebase (Authentication > Settings).");
        } else {
          alert("Error al iniciar sesión: " + (authError.code || "Error desconocido"));
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
