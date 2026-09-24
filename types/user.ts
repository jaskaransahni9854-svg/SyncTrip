export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  bio?: string;
  phone?: string;
  preferences?: {
    currency: string;
    dietaryRestrictions?: string[];
    travelStyle?: 'budget' | 'balanced' | 'luxury' | 'adventure';
  };
}

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
};
