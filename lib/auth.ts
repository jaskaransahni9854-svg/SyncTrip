import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";
import { UserProfile } from "@/types/user";

const LOCAL_USER_KEY = "synctrip_local_user";

export const DEFAULT_DEMO_USER: UserProfile = {
  uid: "demo_traveler_01",
  email: "alex.wanderer@synctrip.com",
  displayName: "Alex Rivera",
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  createdAt: new Date().toISOString(),
  bio: "Adventure photographer and group trip organizer.",
  preferences: {
    currency: "USD",
    travelStyle: "adventure",
    dietaryRestrictions: ["Vegetarian"],
  },
};

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName,
      createdAt: new Date().toISOString(),
      preferences: {
        currency: "USD",
        travelStyle: "balanced",
      },
    };

    await setDoc(doc(db, "users", cred.user.uid), newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    }
    return newProfile;
  }

  // Fallback demo/local storage mode
  const localProfile: UserProfile = {
    uid: "local_" + Date.now().toString(),
    email,
    displayName,
    createdAt: new Date().toISOString(),
    preferences: {
      currency: "USD",
      travelStyle: "balanced",
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localProfile));
  }
  return localProfile;
}

export async function loginWithEmail(
  email: string,
  pass: string
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    let profile: UserProfile;
    if (snap.exists()) {
      profile = snap.data() as UserProfile;
    } else {
      profile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split("@")[0],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), profile);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  }

  // Fallback demo/local mode
  const profile: UserProfile = {
    uid: "local_user_" + email.replace(/[^a-zA-Z0-9]/g, "_"),
    email,
    displayName: email.split("@")[0],
    createdAt: new Date().toISOString(),
    preferences: {
      currency: "USD",
      travelStyle: "balanced",
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  }
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
    return;
  }
  // In demo mode, simulate success
  await new Promise((r) => setTimeout(r, 600));
}

export function getLocalStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(LOCAL_USER_KEY);
    return item ? (JSON.parse(item) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: UserProfile = DEFAULT_DEMO_USER): UserProfile {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  }
  return user;
}
