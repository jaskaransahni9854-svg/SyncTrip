import { TripInvitation, TripRole } from "@/types/trip";
import { UserProfile } from "@/types/user";
import { addTripMember, getTripById } from "./trips";

const LOCAL_INVITATIONS_KEY = "synctrip_local_invitations";

function getLocalInvitations(): TripInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_INVITATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInvitations(invites: TripInvitation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_INVITATIONS_KEY, JSON.stringify(invites));
  } catch (err) {
    console.error("Failed to save invitations:", err);
  }
}

export async function createTripInvitation(
  tripId: string,
  invitedEmail: string,
  role: TripRole,
  invitedBy: UserProfile
): Promise<TripInvitation> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const inviteId = "inv_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation: TripInvitation = {
    id: inviteId,
    tripId,
    tripTitle: trip.title,
    destination: trip.destination,
    invitedEmail,
    invitedBy: {
      uid: invitedBy.uid,
      displayName: invitedBy.displayName,
      photoURL: invitedBy.photoURL,
    },
    role,
    status: "PENDING",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  const invites = getLocalInvitations();
  invites.push(invitation);
  saveLocalInvitations(invites);

  return invitation;
}

export async function getInvitationById(inviteId: string): Promise<TripInvitation | null> {
  const invites = getLocalInvitations();
  const found = invites.find((i) => i.id === inviteId);
  if (found) return found;

  // Generate dynamic mockup if opening a direct link
  return {
    id: inviteId,
    tripId: "trip_kyoto_2026",
    tripTitle: "Kyoto Cherry Blossom Expedition",
    destination: "Kyoto, Japan",
    invitedEmail: "traveler@synctrip.com",
    invitedBy: {
      uid: "demo_traveler_01",
      displayName: "Alex Rivera",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    role: "EDITOR",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function acceptInvitation(
  inviteId: string,
  user: UserProfile
): Promise<{ tripId: string }> {
  const invite = await getInvitationById(inviteId);
  if (!invite) throw new Error("Invitation not found");

  await addTripMember(invite.tripId, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: invite.role,
    joinedAt: new Date().toISOString(),
  });

  const invites = getLocalInvitations();
  const index = invites.findIndex((i) => i.id === inviteId);
  if (index !== -1) {
    invites[index].status = "ACCEPTED";
    saveLocalInvitations(invites);
  }

  return { tripId: invite.tripId };
}
