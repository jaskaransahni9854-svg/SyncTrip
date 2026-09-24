import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Expense, MemberBalance, DebtSettlement } from "@/types/expense";
import { Trip } from "@/types/trip";

const LOCAL_EXPENSES_PREFIX = "synctrip_expenses_";

export const SAMPLE_KYOTO_EXPENSES: Expense[] = [
  {
    id: "exp_01",
    tripId: "trip_kyoto_2026",
    title: "Ryokan Villa Booking (3 Nights)",
    amount: 1850,
    currency: "USD",
    category: "lodging",
    paidByUid: "demo_traveler_01",
    paidByName: "Alex Rivera",
    splitWithMemberUids: ["demo_traveler_01", "member_sarah", "member_kenji", "member_elena"],
    date: "2026-04-05",
    notes: "Traditional private onsen ryokan in Higashiyama.",
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "exp_02",
    tripId: "trip_kyoto_2026",
    title: "Bullet Train (Shinkansen) Passes",
    amount: 680,
    currency: "USD",
    category: "transport",
    paidByUid: "member_kenji",
    paidByName: "Kenji Sato",
    splitWithMemberUids: ["demo_traveler_01", "member_sarah", "member_kenji", "member_elena"],
    date: "2026-04-05",
    notes: "Tokyo to Kyoto round trip reserved seats.",
    createdAt: "2026-01-22T14:30:00Z",
  },
  {
    id: "exp_03",
    tripId: "trip_kyoto_2026",
    title: "Gion Kaiseki Dinner Banquet",
    amount: 380,
    currency: "USD",
    category: "food",
    paidByUid: "member_sarah",
    paidByName: "Sarah Chen",
    splitWithMemberUids: ["demo_traveler_01", "member_sarah", "member_kenji", "member_elena"],
    date: "2026-04-06",
    notes: "Seasonal spring sakura tasting menu.",
    createdAt: "2026-01-25T21:00:00Z",
  },
  {
    id: "exp_04",
    tripId: "trip_kyoto_2026",
    title: "Tea Ceremony Masterclass & Matcha",
    amount: 160,
    currency: "USD",
    category: "activities",
    paidByUid: "member_elena",
    paidByName: "Elena Rostova",
    splitWithMemberUids: ["demo_traveler_01", "member_sarah", "member_kenji", "member_elena"],
    date: "2026-04-07",
    notes: "Authentic ceremony with 15th-generation master.",
    createdAt: "2026-01-28T16:15:00Z",
  },
];

function getLocalExpenses(tripId: string): Expense[] {
  if (typeof window === "undefined") {
    return tripId === "trip_kyoto_2026" ? SAMPLE_KYOTO_EXPENSES : [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_PREFIX + tripId);
    if (!raw) {
      if (tripId === "trip_kyoto_2026") {
        localStorage.setItem(LOCAL_EXPENSES_PREFIX + tripId, JSON.stringify(SAMPLE_KYOTO_EXPENSES));
        return SAMPLE_KYOTO_EXPENSES;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return tripId === "trip_kyoto_2026" ? SAMPLE_KYOTO_EXPENSES : [];
  }
}

function saveLocalExpenses(tripId: string, expenses: Expense[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_EXPENSES_PREFIX + tripId, JSON.stringify(expenses));
  } catch (err) {
    console.error("Failed to save local expenses:", err);
  }
}

export async function getTripExpenses(tripId: string): Promise<Expense[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "trips", tripId, "expenses"),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      const items: Expense[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Expense);
      });
      if (items.length > 0) return items;
    } catch (e) {
      console.warn("Firestore getTripExpenses error:", e);
    }
  }

  return getLocalExpenses(tripId);
}

export async function createExpense(
  tripId: string,
  data: Omit<Expense, "id" | "createdAt">
): Promise<Expense> {
  const expenseId = "exp_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  const now = new Date().toISOString();

  const newExpense: Expense = {
    ...data,
    id: expenseId,
    createdAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "trips", tripId, "expenses", expenseId), newExpense);
    } catch (e) {
      console.warn("Firestore createExpense error:", e);
    }
  }

  const items = getLocalExpenses(tripId);
  items.unshift(newExpense);
  saveLocalExpenses(tripId, items);

  return newExpense;
}

export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "trips", tripId, "expenses", expenseId));
    } catch (e) {
      console.warn("Firestore deleteExpense error:", e);
    }
  }

  const items = getLocalExpenses(tripId).filter((e) => e.id !== expenseId);
  saveLocalExpenses(tripId, items);
}

export function calculateTripBalances(
  trip: Trip,
  expenses: Expense[]
): {
  totalSpent: number;
  remainingBudget: number;
  categoryTotals: Record<string, number>;
  balances: MemberBalance[];
  settlements: DebtSettlement[];
} {
  let totalSpent = 0;
  const categoryTotals: Record<string, number> = {
    lodging: 0,
    transport: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  };

  const memberPaidMap: Record<string, number> = {};
  const memberShareMap: Record<string, number> = {};

  // Initialize all members
  Object.keys(trip.members || {}).forEach((uid) => {
    memberPaidMap[uid] = 0;
    memberShareMap[uid] = 0;
  });

  expenses.forEach((exp) => {
    totalSpent += exp.amount;
    const cat = exp.category || "other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;

    // Track who paid
    memberPaidMap[exp.paidByUid] = (memberPaidMap[exp.paidByUid] || 0) + exp.amount;

    // Split across members
    const splits = exp.splitWithMemberUids.length > 0
      ? exp.splitWithMemberUids
      : Object.keys(trip.members);

    const sharePerPerson = exp.amount / splits.length;
    splits.forEach((uid) => {
      memberShareMap[uid] = (memberShareMap[uid] || 0) + sharePerPerson;
    });
  });

  const balances: MemberBalance[] = Object.keys(trip.members || {}).map((uid) => {
    const member = trip.members[uid];
    const paid = memberPaidMap[uid] || 0;
    const share = memberShareMap[uid] || 0;
    const net = paid - share;
    return {
      memberUid: uid,
      displayName: member?.displayName || "Member",
      totalPaid: Math.round(paid * 100) / 100,
      totalShare: Math.round(share * 100) / 100,
      netBalance: Math.round(net * 100) / 100,
    };
  });

  // Calculate minimum cash transfers (debt settlement)
  const debtors: { uid: string; name: string; amount: number }[] = [];
  const creditors: { uid: string; name: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance < -0.01) {
      debtors.push({ uid: b.memberUid, name: b.displayName, amount: -b.netBalance });
    } else if (b.netBalance > 0.01) {
      creditors.push({ uid: b.memberUid, name: b.displayName, amount: b.netBalance });
    }
  });

  const settlements: DebtSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      settlements.push({
        fromUid: debtor.uid,
        fromName: debtor.name,
        toUid: creditor.uid,
        toName: creditor.name,
        amount: Math.round(settleAmount * 100) / 100,
        currency: trip.currency || "USD",
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  const remainingBudget = Math.max(0, trip.totalBudget - totalSpent);

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    categoryTotals,
    balances,
    settlements,
  };
}
