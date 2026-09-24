"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { UserProfile } from "@/types/user";
import {
  getLocalStoredUser,
  setDemoUser,
  logoutUser,
  loginWithEmail,
  signUpWithEmail,
  resetPassword as resetPasswordHelper,
  DEFAULT_DEMO_USER,
} from "@/lib/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  signup: (displayName: string, email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  loginDemo: (customProfile?: UserProfile) => void;
  resetPassword: (email: string) => Promise<void>;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getLocalStoredUser());
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (!isFirebaseConfigured) return false;
    return !getLocalStoredUser();
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db!, "users", fbUser.uid));
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUser(profile);
          } else {
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || "",
              displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Traveler",
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Error fetching Firestore user profile:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const profile = await loginWithEmail(email, pass);
    startTransition(() => {
      setUser(profile);
    });
    return profile;
  };

  const signup = async (displayName: string, email: string, pass: string) => {
    const profile = await signUpWithEmail(email, pass, displayName);
    startTransition(() => {
      setUser(profile);
    });
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    startTransition(() => {
      setUser(null);
    });
  };

  const loginDemo = (customProfile?: UserProfile) => {
    const profile = setDemoUser(customProfile || DEFAULT_DEMO_USER);
    startTransition(() => {
      setUser(profile);
    });
  };

  const resetPassword = async (email: string) => {
    await resetPasswordHelper(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        loginDemo,
        resetPassword,
        isFirebaseActive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
