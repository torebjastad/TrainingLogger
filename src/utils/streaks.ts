import { subDays, addDays, format } from 'date-fns';
import type { DayLog } from '../types';

function weekSetCount(now: Date, weeksBack: number, exerciseId: string, logs: DayLog[]): number {
  const ref = subDays(now, weeksBack * 7);
  const daysFromMon = (ref.getDay() + 6) % 7;
  const weekStart = subDays(ref, daysFromMon);
  const weekEnd = addDays(weekStart, 6);
  const startKey = format(weekStart, 'yyyy-MM-dd');
  const endKey = format(weekEnd, 'yyyy-MM-dd');
  return logs
    .filter((l) => l.exerciseId === exerciseId && l.date >= startKey && l.date <= endKey)
    .reduce((s, l) => s + l.sets.length, 0);
}

export function computeWeeklyStreak(
  exerciseId: string,
  setsPerWeek: number,
  logs: DayLog[]
): number {
  const now = new Date();
  let streak = 0;
  let foundStart = false;
  for (let w = 0; w < 52; w++) {
    const sets = weekSetCount(now, w, exerciseId, logs);
    if (sets >= setsPerWeek) {
      foundStart = true;
      streak++;
    } else if (foundStart) {
      break;
    }
  }
  return streak;
}

export function currentWeekSetCount(exerciseId: string, logs: DayLog[]): number {
  return weekSetCount(new Date(), 0, exerciseId, logs);
}
