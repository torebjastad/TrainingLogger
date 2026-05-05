import { useState, useMemo } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import { NumberScrubber } from './NumberScrubber';
import { useStore } from '../store/useStore';
import { computeWeeklyStreak, currentWeekSetCount } from '../utils/streaks';
import type { Exercise, LoggedSet } from '../types';

interface Props {
  exercise: Exercise;
  dateKey: string;
  sets: LoggedSet[];
  onGoalReached?: (info: { exerciseName: string; streak: number }) => void;
}

const CATEGORY_COLORS: Record<Exercise['category'], string> = {
  pulling: 'bg-blue-500/20 text-blue-300',
  pushing: 'bg-orange-500/20 text-orange-300',
  core: 'bg-purple-500/20 text-purple-300',
  legs: 'bg-green-500/20 text-green-300',
  other: 'bg-white/10 text-white/50',
};

function median(reps: number[]): number {
  const sorted = [...reps].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function ExerciseCard({ exercise, dateKey, sets, onGoalReached }: Props) {
  const logSet = useStore((s) => s.logSet);
  const updateSet = useStore((s) => s.updateSet);
  const removeSet = useStore((s) => s.removeSet);
  const allLogs = useStore((s) => s.logs);

  const seedReps = useMemo(() => {
    if (sets.length > 0) return sets[sets.length - 1].reps;
    const previous = allLogs
      .filter((l) => l.exerciseId === exercise.id && l.date < dateKey && l.sets.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (previous.length === 0) return exercise.defaultReps;
    return median(previous[0].sets.map((s) => s.reps));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const streak = useMemo(() => {
    if (!exercise.goals?.setsPerWeek) return 0;
    return computeWeeklyStreak(exercise.id, exercise.goals.setsPerWeek, allLogs);
  }, [exercise.id, exercise.goals?.setsPerWeek, allLogs]);

  const [reps, setReps] = useState(seedReps);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState(0);

  const handleLog = () => {
    const goal = exercise.goals?.setsPerWeek;
    if (goal && onGoalReached) {
      const before = currentWeekSetCount(exercise.id, allLogs);
      if (before < goal && before + 1 >= goal) {
        logSet(dateKey, exercise.id, reps);
        const newStreak = computeWeeklyStreak(exercise.id, goal, useStore.getState().logs);
        onGoalReached({ exerciseName: exercise.name, streak: newStreak });
        return;
      }
    }
    logSet(dateKey, exercise.id, reps);
  };

  const startEdit = (setId: string, currentReps: number) => {
    setEditingId(setId);
    setEditReps(currentReps);
  };

  const confirmEdit = (setId: string) => {
    updateSet(dateKey, exercise.id, setId, editReps);
    setEditingId(null);
  };

  const clamp = (n: number) => Math.min(999, Math.max(1, n));

  return (
    <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
      {/* Exercise header row */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white font-semibold text-[15px] leading-tight truncate">
              {exercise.name}
            </span>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${CATEGORY_COLORS[exercise.category]}`}
            >
              {exercise.category}
            </span>
            {streak > 0 && (
              <span className="text-[11px] font-bold text-[#FF9F0A]">🔥{streak}</span>
            )}
          </div>
          {sets.length > 0 && (
            <p className="text-white/40 text-[11px] mt-1">
              {sets.length} set{sets.length !== 1 ? 's' : ''} logged
            </p>
          )}
        </div>

        {/* Scrubber + confirm */}
        <div className="flex items-center gap-1.5 shrink-0">
          <NumberScrubber value={reps} onChange={setReps} />
          <button
            onClick={handleLog}
            className="w-11 h-11 rounded-full bg-[#30D158] hover:bg-[#34e55f] active:bg-[#28b84c]
                       flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-[#30D158]/20"
            aria-label="Log set"
          >
            <Check size={20} strokeWidth={2.5} className="text-black" />
          </button>
        </div>
      </div>

      {/* Logged sets chips */}
      {sets.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          {sets.map((set, i) =>
            editingId === set.id ? (
              /* ── Expanded edit chip ── */
              <div
                key={set.id}
                className="basis-full flex items-center gap-2 bg-white/10 border border-white/20
                           rounded-xl px-3 py-2"
              >
                <span className="text-white/40 text-xs w-10 shrink-0">Set {i + 1}</span>

                <div className="flex items-center gap-0.5 flex-1">
                  <button
                    onClick={() => setEditReps(clamp(editReps - 1))}
                    className="w-7 h-7 rounded-l-lg bg-white/10 hover:bg-white/20 text-white/70
                               hover:text-white flex items-center justify-center text-lg leading-none"
                    aria-label="decrease"
                  >−</button>
                  <div className="h-7 px-3 bg-white/10 flex items-center justify-center border-y border-white/10">
                    <span className="text-white font-semibold text-sm tabular-nums">{editReps}</span>
                  </div>
                  <button
                    onClick={() => setEditReps(clamp(editReps + 1))}
                    className="w-7 h-7 rounded-r-lg bg-white/10 hover:bg-white/20 text-white/70
                               hover:text-white flex items-center justify-center text-lg leading-none"
                    aria-label="increase"
                  >+</button>
                </div>

                <button
                  onClick={() => confirmEdit(set.id)}
                  className="w-8 h-8 rounded-full bg-[#30D158] flex items-center justify-center
                             active:scale-95 transition-transform"
                  aria-label="Save"
                >
                  <Check size={15} strokeWidth={2.5} className="text-black" />
                </button>

                <button
                  onClick={() => { removeSet(dateKey, exercise.id, set.id); setEditingId(null); }}
                  className="w-8 h-8 rounded-full bg-[#FF375F]/20 flex items-center justify-center
                             hover:bg-[#FF375F]/40 active:scale-95 transition-all"
                  aria-label="Delete set"
                >
                  <Trash2 size={14} className="text-[#FF375F]" />
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                             hover:bg-white/15 active:scale-95 transition-all"
                  aria-label="Cancel"
                >
                  <X size={14} className="text-white/50" />
                </button>
              </div>
            ) : (
              /* ── Normal chip — tap to edit ── */
              <button
                key={set.id}
                onClick={() => startEdit(set.id, set.reps)}
                className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 active:bg-white/18
                           transition-colors rounded-lg px-2.5 py-1.5"
                aria-label={`Edit set ${i + 1}: ${set.reps} reps`}
              >
                <span className="text-white/40 text-xs">Set {i + 1}</span>
                <span className="text-white font-semibold text-sm">{set.reps}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
