export interface Exercise {
  id: string;
  name: string;
  category: 'pulling' | 'pushing' | 'core' | 'legs' | 'other';
  isFavorite: boolean;
  defaultReps: number;
}

export interface LoggedSet {
  id: string;
  reps: number;
  timestamp: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  exerciseId: string;
  sets: LoggedSet[];
}
