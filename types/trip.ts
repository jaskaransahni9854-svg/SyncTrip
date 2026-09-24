export type TripRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface TripMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: TripRole;
  joinedAt: string;
}

export type TripStatus = 'planning' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  destinationPlaceId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  coverImage?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  ownerId: string;
  memberIds: string[];
  members: Record<string, TripMember>;
  createdAt: string;
  updatedAt: string;
  status: TripStatus;
  description?: string;
  aiGenerated?: boolean;
}

export interface TripInvitation {
  id: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  invitedEmail: string;
  invitedBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  role: TripRole;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  expiresAt: string;
}
