export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'transport'
  | 'lodging'
  | 'leisure'
  | 'shopping'
  | 'entertainment';

export interface ItineraryItem {
  id: string;
  dayNumber: number; // 1, 2, 3...
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title: string;
  description?: string;
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: ActivityCategory;
  estimatedCost: number;
  currency: string;
  notes?: string;
  addedByUid: string;
  addedByName: string;
  votes?: Record<string, 'up' | 'down'>;
  createdAt: string;
  updatedAt: string;
}

export interface DaySchedule {
  dayNumber: number;
  date: string;
  items: ItineraryItem[];
}
