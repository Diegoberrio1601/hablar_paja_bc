"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  User,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface BanNotice {
  isActive: boolean;
  reason?: string;
  until?: Date | null;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  banNotice: BanNotice | null;
  calendarToken: string | null;
  login: (requestCalendar?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearBanNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banNotice, setBanNotice] = useState<BanNotice | null>(null);
  const [calendarToken, setCalendarToken_] = useState<string | null>(null);

  // Wrapper for token storage
  const setCalendarToken = (token: string | null) => {
    setCalendarToken_(token);
    if (token) {
      localStorage.setItem('google_calendar_token', token);
    } else {
      localStorage.removeItem('google_calendar_token');
    }
  };

  useEffect(() => {
    // Recover token on mount
    const storedToken = localStorage.getItem('google_calendar_token');
    if (storedToken) setCalendarToken_(storedToken);

    if (!auth) {
      console.warn("Firebase Auth not initialized. Check environment variables.");
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Check for redirect result on mount
    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCalendarToken(credential.accessToken);
        }
      }
    }).catch((error: unknown) => {
      console.error("Redirect auth error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      if (user && db) {
        // Check if user is banned
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (userData?.isBanned) {
          const now = Date.now();
          const bannedUntilDate = userData.bannedUntil?.toDate?.() || null;
          
          if (bannedUntilDate && now > bannedUntilDate.getTime()) {
            // Ban has expired! Auto-unban
            await updateDoc(doc(db, "users", user.uid), {
              isBanned: false,
              bannedUntil: null
            });

            // Notify via Email (background)
            fetch('/api/admin/notify-ban', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.displayName,
                type: 'unban'
              })
            }).catch(err => console.error("Auto-unban notification error:", err));
            
            // Allow login to continue...
          } else {
            // Still banned (timed or permanent)
            setBanNotice({
              isActive: true,
              reason: userData.banReason || "Incumplimiento de normas de la comunidad.",
              until: bannedUntilDate
            });
            await signOut(auth!);
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }
        }

        // Sync user data
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
          isBanned: userData?.isBanned || false
        }, { merge: true });
      }

      setUser(user);
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(',') || [];
      setIsAdmin(!!user?.email && adminEmails.includes(user.email));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = async (requestCalendar: boolean = false) => {
    if (!auth || isAuthenticating) return;

    if (requestCalendar) {
      googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
    }

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
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCalendarToken(credential.accessToken);
      }
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

  const clearBanNotice = () => setBanNotice(null);

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setBanNotice(null);
      setCalendarToken(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      banNotice, 
      calendarToken,
      login, 
      logout, 
      clearBanNotice 
    }}>
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
