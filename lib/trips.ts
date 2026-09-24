import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Trip, TripMember } from "@/types/trip";

const LOCAL_TRIPS_KEY = "synctrip_local_trips";

export const SAMPLE_DEMO_TRIP: Trip = {
  id: "trip_kyoto_2026",
  title: "Kyoto Cherry Blossom Expedition",
  destination: "Kyoto, Japan",
  destinationPlaceId: "ChIJ8T1tN5wIAWAR6vN2y3k6ZcQ",
  coordinates: {
    lat: 35.0116,
    lng: 135.7681,
  },
  coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  startDate: "2026-04-05",
  endDate: "2026-04-12",
  totalBudget: 4200,
  currency: "USD",
  ownerId: "demo_traveler_01",
  memberIds: ["demo_traveler_01", "member_sarah", "member_kenji", "member_elena"],
  members: {
    demo_traveler_01: {
      uid: "demo_traveler_01",
      email: "alex.wanderer@synctrip.com",
      displayName: "Alex Rivera",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "OWNER",
      joinedAt: "2026-01-10T10:00:00Z",
    },
    member_sarah: {
      uid: "member_sarah",
      email: "sarah.chen@example.com",
      displayName: "Sarah Chen",
      photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      role: "EDITOR",
      joinedAt: "2026-01-11T12:30:00Z",
    },
    member_kenji: {
      uid: "member_kenji",
      email: "kenji.sato@example.com",
      displayName: "Kenji Sato",
      photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "EDITOR",
      joinedAt: "2026-01-12T09:15:00Z",
    },
    member_elena: {
      uid: "member_elena",
      email: "elena.rostova@example.com",
      displayName: "Elena Rostova",
      photoURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
      role: "VIEWER",
      joinedAt: "2026-01-13T14:40:00Z",
    },
  },
  createdAt: "2026-01-10T10:00:00Z",
  updatedAt: "2026-02-15T18:20:00Z",
  status: "planning",
  description: "Spring pilgrimage exploring ancient shrines, bamboo forests, Michelin matcha houses, and Gion tea ceremonies.",
  aiGenerated: true,
};

function getLocalTrips(): Trip[] {
  if (typeof window === "undefined") return [SAMPLE_DEMO_TRIP];
  try {
    const raw = localStorage.getItem(LOCAL_TRIPS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify([SAMPLE_DEMO_TRIP]));
      return [SAMPLE_DEMO_TRIP];
    }
    return JSON.parse(raw);
  } catch {
    return [SAMPLE_DEMO_TRIP];
  }
}

function saveLocalTrips(trips: Trip[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error("Failed to write trips to local storage", err);
  }
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  if (isFirebaseConfigured && db) {
    try {
      const tripsRef = collection(db, "trips");
      const q = query(
        tripsRef,
        where("memberIds", "array-contains", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const results: Trip[] = [];
      snapshot.forEach((d) => {
        results.push({ id: d.id, ...d.data() } as Trip);
      });
      if (results.length > 0) return results;
    } catch (e) {
      console.warn("Firestore fetch error, falling back to local trips:", e);
    }
  }

  // Fallback to local storage trips
  const allLocal = getLocalTrips();
  return allLocal.filter(
    (t) => t.ownerId === userId || t.memberIds.includes(userId)
  );
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "trips", tripId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Trip;
      }
    } catch (e) {
      console.warn("Firestore getTripById fallback:", e);
    }
  }

  const all = getLocalTrips();
  return all.find((t) => t.id === tripId) || null;
}

export async function createTrip(
  tripData: Omit<Trip, "id" | "createdAt" | "updatedAt">
): Promise<Trip> {
  const tripId = "trip_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newTrip: Trip = {
    ...tripData,
    id: tripId,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "trips", tripId), newTrip);
    } catch (e) {
      console.warn("Firestore createTrip error:", e);
    }
  }

  const trips = getLocalTrips();
  trips.unshift(newTrip);
  saveLocalTrips(trips);

  return newTrip;
}

export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, "trips", tripId), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateTrip fallback:", e);
    }
  }

  const trips = getLocalTrips();
  const index = trips.findIndex((t) => t.id === tripId);
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updates, updatedAt: now };
    saveLocalTrips(trips);
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "trips", tripId));
    } catch (e) {
      console.warn("Firestore deleteTrip fallback:", e);
    }
  }

  const trips = getLocalTrips().filter((t) => t.id !== tripId);
  saveLocalTrips(trips);
}

export async function addTripMember(tripId: string, member: TripMember): Promise<void> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const updatedMembers = { ...trip.members, [member.uid]: member };
  const updatedMemberIds = Array.from(new Set([...trip.memberIds, member.uid]));

  await updateTrip(tripId, {
    members: updatedMembers,
    memberIds: updatedMemberIds,
  });
}

export async function removeTripMember(tripId: string, memberUid: string): Promise<void> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const remainingMembers = { ...trip.members };
  delete remainingMembers[memberUid];
  const updatedMemberIds = trip.memberIds.filter((id) => id !== memberUid);

  await updateTrip(tripId, {
    members: remainingMembers,
    memberIds: updatedMemberIds,
  });
}
