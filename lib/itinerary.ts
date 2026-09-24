import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { ItineraryItem } from "@/types/itinerary";

const LOCAL_ITINERARY_PREFIX = "synctrip_itinerary_";

export const SAMPLE_KYOTO_ITINERARY: ItineraryItem[] = [
  {
    id: "act_01",
    dayNumber: 1,
    date: "2026-04-05",
    time: "09:30",
    title: "Fushimi Inari-taisha Torii Path",
    description: "Morning hike through the thousands of iconic vermilion torii gates winding up Mount Inari.",
    locationName: "Fushimi Inari Shrine, Kyoto",
    coordinates: { lat: 34.9671, lng: 135.7727 },
    category: "sightseeing",
    estimatedCost: 0,
    currency: "USD",
    notes: "Arrive early before tourist buses. Bring comfortable walking shoes.",
    addedByUid: "demo_traveler_01",
    addedByName: "Alex Rivera",
    votes: { demo_traveler_01: "up", member_sarah: "up", member_kenji: "up" },
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "act_02",
    dayNumber: 1,
    date: "2026-04-05",
    time: "13:00",
    title: "Nishiki Market Street Food Safari",
    description: "Tasting local delicacies: tako tamago (baby octopus), matcha soft serve, and freshly fried tempura.",
    locationName: "Nishiki Market, Nakagyo Ward",
    coordinates: { lat: 35.0051, lng: 135.7649 },
    category: "food",
    estimatedCost: 35,
    currency: "USD",
    notes: "Group budget covers snacks for everyone.",
    addedByUid: "member_sarah",
    addedByName: "Sarah Chen",
    votes: { demo_traveler_01: "up", member_sarah: "up" },
    createdAt: "2026-01-15T11:30:00Z",
    updatedAt: "2026-01-15T11:30:00Z",
  },
  {
    id: "act_03",
    dayNumber: 2,
    date: "2026-04-06",
    time: "10:00",
    title: "Arashiyama Bamboo Grove & Monkey Park",
    description: "Walk the towering bamboo paths and take the scenic train along the Hozugawa River.",
    locationName: "Arashiyama, Ukyo Ward",
    coordinates: { lat: 35.0169, lng: 135.6713 },
    category: "sightseeing",
    estimatedCost: 15,
    currency: "USD",
    notes: "Book romantic train tickets in advance!",
    addedByUid: "member_kenji",
    addedByName: "Kenji Sato",
    votes: { demo_traveler_01: "up", member_kenji: "up", member_elena: "up" },
    createdAt: "2026-01-16T14:20:00Z",
    updatedAt: "2026-01-16T14:20:00Z",
  },
  {
    id: "act_04",
    dayNumber: 2,
    date: "2026-04-06",
    time: "18:30",
    title: "Traditional Kaiseki Dinner in Gion",
    description: "Multi-course seasonal Kyoto banquet in an authentic preserved machiya townhouse.",
    locationName: "Gion District, Higashiyama Ward",
    coordinates: { lat: 35.0037, lng: 135.7778 },
    category: "food",
    estimatedCost: 95,
    currency: "USD",
    notes: "Smart casual dress code.",
    addedByUid: "demo_traveler_01",
    addedByName: "Alex Rivera",
    votes: { demo_traveler_01: "up", member_sarah: "up", member_kenji: "up", member_elena: "up" },
    createdAt: "2026-01-16T16:00:00Z",
    updatedAt: "2026-01-16T16:00:00Z",
  },
  {
    id: "act_05",
    dayNumber: 3,
    date: "2026-04-07",
    time: "11:00",
    title: "Kinkaku-ji (Golden Pavilion) & Ryoan-ji Zen Garden",
    description: "Explore the shimmering gold leaf pavilion reflecting over the pond, followed by meditation at the rock garden.",
    locationName: "Kita Ward, Kyoto",
    coordinates: { lat: 35.0394, lng: 135.7292 },
    category: "sightseeing",
    estimatedCost: 10,
    currency: "USD",
    addedByUid: "member_elena",
    addedByName: "Elena Rostova",
    votes: { member_elena: "up" },
    createdAt: "2026-01-17T10:00:00Z",
    updatedAt: "2026-01-17T10:00:00Z",
  },
];

function getLocalItinerary(tripId: string): ItineraryItem[] {
  if (typeof window === "undefined") {
    return tripId === "trip_kyoto_2026" ? SAMPLE_KYOTO_ITINERARY : [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_ITINERARY_PREFIX + tripId);
    if (!raw) {
      if (tripId === "trip_kyoto_2026") {
        localStorage.setItem(LOCAL_ITINERARY_PREFIX + tripId, JSON.stringify(SAMPLE_KYOTO_ITINERARY));
        return SAMPLE_KYOTO_ITINERARY;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return tripId === "trip_kyoto_2026" ? SAMPLE_KYOTO_ITINERARY : [];
  }
}

function saveLocalItinerary(tripId: string, items: ItineraryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_ITINERARY_PREFIX + tripId, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save local itinerary:", err);
  }
}

export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "trips", tripId, "itinerary"),
        orderBy("dayNumber", "asc")
      );
      const snapshot = await getDocs(q);
      const items: ItineraryItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ItineraryItem);
      });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn("Firestore getItineraryItems error:", e);
    }
  }

  return getLocalItinerary(tripId);
}

export async function createItineraryItem(
  tripId: string,
  itemData: Omit<ItineraryItem, "id" | "createdAt" | "updatedAt">
): Promise<ItineraryItem> {
  const itemId = "act_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  const now = new Date().toISOString();

  const newItem: ItineraryItem = {
    ...itemData,
    id: itemId,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "trips", tripId, "itinerary", itemId), newItem);
    } catch (e) {
      console.warn("Firestore createItineraryItem error:", e);
    }
  }

  const items = getLocalItinerary(tripId);
  items.push(newItem);
  saveLocalItinerary(tripId, items);

  return newItem;
}

export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  updates: Partial<ItineraryItem>
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, "trips", tripId, "itinerary", itemId), {
        ...updates,
        updatedAt: now,
      });
    } catch (e) {
      console.warn("Firestore updateItineraryItem error:", e);
    }
  }

  const items = getLocalItinerary(tripId);
  const index = items.findIndex((i) => i.id === itemId);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: now };
    saveLocalItinerary(tripId, items);
  }
}

export async function deleteItineraryItem(tripId: string, itemId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "trips", tripId, "itinerary", itemId));
    } catch (e) {
      console.warn("Firestore deleteItineraryItem error:", e);
    }
  }

  const items = getLocalItinerary(tripId).filter((i) => i.id !== itemId);
  saveLocalItinerary(tripId, items);
}

export async function voteItineraryItem(
  tripId: string,
  itemId: string,
  uid: string,
  vote: "up" | "down"
): Promise<void> {
  const items = getLocalItinerary(tripId);
  const item = items.find((i) => i.id === itemId);
  if (!item) return;

  const currentVotes = { ...(item.votes || {}) };
  if (currentVotes[uid] === vote) {
    delete currentVotes[uid];
  } else {
    currentVotes[uid] = vote;
  }

  await updateItineraryItem(tripId, itemId, { votes: currentVotes });
}

export async function batchSetItinerary(
  tripId: string,
  newItems: ItineraryItem[]
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      for (const item of newItems) {
        await setDoc(doc(db, "trips", tripId, "itinerary", item.id), item);
      }
    } catch (e) {
      console.warn("Firestore batchSetItinerary error:", e);
    }
  }

  saveLocalItinerary(tripId, newItems);
}
