import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, DayLog, LoggedSet } from '../types';

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'hangups', name: 'Hang-ups', category: 'pulling', isFavorite: true, defaultReps: 10 },
  { id: 'pullups', name: 'Pull-ups', category: 'pulling', isFavorite: true, defaultReps: 8 },
  { id: 'pushups', name: 'Push-ups', category: 'pushing', isFavorite: false, defaultReps: 15 },
  { id: 'dips', name: 'Dips', category: 'pushing', isFavorite: false, defaultReps: 10 },
  { id: 'chinups', name: 'Chin-ups', category: 'pulling', isFavorite: false, defaultReps: 8 },
  { id: 'plank', name: 'Plank', category: 'core', isFavorite: false, defaultReps: 30 },
  { id: 'legraises', name: 'Leg Raises', category: 'core', isFavorite: false, defaultReps: 12 },
  { id: 'squats', name: 'Squats', category: 'legs', isFavorite: false, defaultReps: 20 },
  { id: 'lunges', name: 'Lunges', category: 'legs', isFavorite: false, defaultReps: 12 },
  { id: 'muscleups', name: 'Muscle-ups', category: 'pulling', isFavorite: false, defaultReps: 5 },
];

interface Store {
  exercises: Exercise[];
  logs: DayLog[];

  // Exercise management
  toggleFavorite: (id: string) => void;
  addExercise: (name: string, category: Exercise['category']) => void;

  // Logging
  logSet: (date: string, exerciseId: string, reps: number) => void;
  removeSet: (date: string, exerciseId: string, setId: string) => void;
  getLogsForDate: (date: string) => DayLog[];
  getLogsForExercise: (exerciseId: string) => DayLog[];
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_EXERCISES,
      logs: [],

      toggleFavorite: (id) =>
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
          ),
        })),

      addExercise: (name, category) =>
        set((s) => ({
          exercises: [
            ...s.exercises,
            {
              id: `custom-${Date.now()}`,
              name,
              category,
              isFavorite: true,
              defaultReps: 10,
            },
          ],
        })),

      logSet: (date, exerciseId, reps) => {
        const newSet: LoggedSet = {
          id: `set-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          reps,
          timestamp: Date.now(),
        };
        set((s) => {
          const existing = s.logs.find(
            (l) => l.date === date && l.exerciseId === exerciseId
          );
          if (existing) {
            return {
              logs: s.logs.map((l) =>
                l.date === date && l.exerciseId === exerciseId
                  ? { ...l, sets: [...l.sets, newSet] }
                  : l
              ),
            };
          }
          return {
            logs: [...s.logs, { date, exerciseId, sets: [newSet] }],
          };
        });
      },

      removeSet: (date, exerciseId, setId) =>
        set((s) => ({
          logs: s.logs.map((l) =>
            l.date === date && l.exerciseId === exerciseId
              ? { ...l, sets: l.sets.filter((set) => set.id !== setId) }
              : l
          ),
        })),

      getLogsForDate: (date) => get().logs.filter((l) => l.date === date),

      getLogsForExercise: (exerciseId) =>
        get().logs.filter((l) => l.exerciseId === exerciseId),
    }),
    { name: 'training-logger-v1' }
  )
);
