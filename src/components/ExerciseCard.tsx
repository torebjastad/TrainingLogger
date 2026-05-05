import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { NumberScrubber } from './NumberScrubber';
import { useStore } from '../store/useStore';
import type { Exercise, LoggedSet } from '../types';

interface Props {
  exercise: Exercise;
  dateKey: string;
  sets: LoggedSet[];
}

const CATEGORY_COLORS: Record<Exercise['category'], string> = {
  pulling: 'bg-blue-500/20 text-blue-300',
  pushing: 'bg-orange-500/20 text-orange-300',
  core: 'bg-purple-500/20 text-purple-300',
  legs: 'bg-green-500/20 text-green-300',
  other: 'bg-white/10 text-white/50',
};

export function ExerciseCard({ exercise, dateKey, sets }: Props) {
  const logSet = useStore((s) => s.logSet);
  const removeSet = useStore((s) => s.removeSet);
  const lastReps = sets.length > 0 ? sets[sets.length - 1].reps : exercise.defaultReps;
  const [reps, setReps] = useState(lastReps);

  const handleLog = () => {
    logSet(dateKey, exercise.id, reps);
  };

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
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {sets.map((set, i) => (
            <div
              key={set.id}
              className="group flex items-center gap-1 bg-white/8 hover:bg-white/12 transition-colors
                         rounded-lg px-2.5 py-1.5"
            >
              <span className="text-white/40 text-xs">Set {i + 1}</span>
              <span className="text-white font-semibold text-sm">{set.reps}</span>
              <button
                onClick={() => removeSet(dateKey, exercise.id, set.id)}
                className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity
                           text-white/30 hover:text-white/70"
                aria-label={`Remove set ${i + 1}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
