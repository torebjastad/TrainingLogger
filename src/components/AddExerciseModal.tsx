import { useState, useEffect } from 'react';
import { X, Plus, Star, Trash2, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Exercise } from '../types';

interface Props {
  onClose: () => void;
}

const CATEGORIES: { value: Exercise['category']; label: string }[] = [
  { value: 'pulling', label: 'Pulling' },
  { value: 'pushing', label: 'Pushing' },
  { value: 'core', label: 'Core' },
  { value: 'legs', label: 'Legs' },
  { value: 'other', label: 'Other' },
];

function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onChange(clamp(value - 1))}
        className="w-9 h-9 rounded-l-xl bg-white/10 hover:bg-white/20 text-white/60
                   hover:text-white flex items-center justify-center text-xl leading-none"
        aria-label="decrease"
      >−</button>
      <div className="h-9 min-w-[3.5rem] px-3 bg-white/10 border-y border-white/10
                      flex items-center justify-center">
        <span className="text-white font-semibold text-sm tabular-nums">
          {value === 0 ? '—' : value}
        </span>
      </div>
      <button
        onClick={() => onChange(clamp(value + 1))}
        className="w-9 h-9 rounded-r-xl bg-white/10 hover:bg-white/20 text-white/60
                   hover:text-white flex items-center justify-center text-xl leading-none"
        aria-label="increase"
      >+</button>
    </div>
  );
}

export function AddExerciseModal({ onClose }: Props) {
  const { exercises, toggleFavorite, addExercise, deleteExerciseLogs, updateGoals, logs } =
    useStore();
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<Exercise['category']>('other');
  const [showNew, setShowNew] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<Exercise | null>(null);
  const [pendingGoals, setPendingGoals] = useState<Exercise | null>(null);
  const [goalMaxReps, setGoalMaxReps] = useState(0);
  const [goalSetsPerWeek, setGoalSetsPerWeek] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingGoals) setPendingGoals(null);
        else if (pendingRemove) setPendingRemove(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, pendingRemove, pendingGoals]);

  const openGoals = (ex: Exercise) => {
    setGoalMaxReps(ex.goals?.maxReps ?? 0);
    setGoalSetsPerWeek(ex.goals?.setsPerWeek ?? 0);
    setPendingGoals(ex);
  };

  const saveGoals = () => {
    if (!pendingGoals) return;
    updateGoals(pendingGoals.id, {
      maxReps: goalMaxReps > 0 ? goalMaxReps : undefined,
      setsPerWeek: goalSetsPerWeek > 0 ? goalSetsPerWeek : undefined,
    });
    setPendingGoals(null);
  };

  const nonFavorites = exercises.filter((e) => !e.isFavorite);
  const favorites = exercises.filter((e) => e.isFavorite);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addExercise(trimmed, newCat);
    setNewName('');
    setShowNew(false);
  };

  const handleRemoveFavorite = (ex: Exercise) => {
    const hasLogs = logs.some((l) => l.exerciseId === ex.id);
    if (hasLogs) {
      setPendingRemove(ex);
    } else {
      toggleFavorite(ex.id);
    }
  };

  const confirmRemove = (deleteLogs: boolean) => {
    if (!pendingRemove) return;
    if (deleteLogs) deleteExerciseLogs(pendingRemove.id);
    toggleFavorite(pendingRemove.id);
    setPendingRemove(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Manage exercises"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1c1c1e] rounded-t-3xl pt-5 pb-8 px-4 z-10 max-h-[80vh] overflow-y-auto">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Exercises</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Non-favorite exercises to add */}
        {nonFavorites.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium px-1 mb-2">
              Add to favorites
            </p>
            {nonFavorites.map((ex) => (
              <button
                key={ex.id}
                onClick={() => toggleFavorite(ex.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                           bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors text-left"
              >
                <Star size={16} className="text-white/30" />
                <span className="text-white font-medium text-sm flex-1">{ex.name}</span>
                <span className="text-[11px] text-white/30">{ex.category}</span>
                <Plus size={16} className="text-[#007AFF]" />
              </button>
            ))}
          </div>
        )}

        {/* Create custom exercise */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium px-1 mb-3">
            Create custom
          </p>
          {showNew ? (
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Exercise name"
                className="w-full bg-white/8 text-white placeholder-white/30 rounded-xl px-4 py-3
                           text-sm border border-white/10 focus:border-[#007AFF]/60 outline-none"
              />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewCat(c.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      newCat === c.value
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-white/8 text-white/60 hover:bg-white/12'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNew(false)}
                  className="flex-1 py-3 rounded-xl bg-white/8 text-white/60 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#007AFF] disabled:opacity-40
                             text-white text-sm font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                         bg-white/5 hover:bg-white/10 transition-colors border border-dashed border-white/15"
            >
              <Plus size={16} className="text-[#007AFF]" />
              <span className="text-[#007AFF] font-medium text-sm">New exercise</span>
            </button>
          )}
        </div>

        {/* Favorites — remove or set goals */}
        {favorites.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium px-1 mb-3">
              Your favorites
            </p>
            <div className="space-y-2">
              {favorites.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5"
                >
                  <button
                    onClick={() => handleRemoveFavorite(ex)}
                    className="w-8 h-8 flex items-center justify-center shrink-0
                               hover:bg-white/10 rounded-lg transition-colors"
                    aria-label={`Remove ${ex.name} from favorites`}
                  >
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </button>
                  <span className="text-white font-medium text-sm flex-1 truncate">{ex.name}</span>
                  {(ex.goals?.maxReps || ex.goals?.setsPerWeek) && (
                    <span className="text-[10px] text-white/30 shrink-0">
                      {[
                        ex.goals.maxReps && `${ex.goals.maxReps} rep goal`,
                        ex.goals.setsPerWeek && `${ex.goals.setsPerWeek}×/wk`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                  <button
                    onClick={() => openGoals(ex)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                               bg-white/8 hover:bg-white/15 transition-colors shrink-0"
                    aria-label={`Set goals for ${ex.name}`}
                  >
                    <Target size={12} className="text-[#007AFF]" />
                    <span className="text-[#007AFF] text-[11px] font-medium">Goals</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Remove confirmation sheet ── */}
      {pendingRemove && (
        <div className="absolute inset-0 z-20 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingRemove(null)} />
          <div className="relative w-full max-w-md bg-[#2c2c2e] rounded-t-3xl pt-5 pb-8 px-4 z-30">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="w-9 h-9 rounded-xl bg-[#FF375F]/15 flex items-center justify-center shrink-0">
                <Star size={18} className="text-[#FF375F]" />
              </div>
              <div>
                <p className="text-white font-semibold text-[15px]">Remove {pendingRemove.name}?</p>
                <p className="text-white/40 text-xs mt-0.5">You have training history for this exercise.</p>
              </div>
            </div>
            <div className="space-y-2 mt-5">
              <button
                onClick={() => confirmRemove(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                           bg-white/8 hover:bg-white/12 active:bg-white/16 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Remove from favorites</p>
                  <p className="text-white/40 text-xs mt-0.5">Keep training data — history reappears if re-added</p>
                </div>
              </button>
              <button
                onClick={() => confirmRemove(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                           bg-[#FF375F]/10 hover:bg-[#FF375F]/18 active:bg-[#FF375F]/25
                           transition-colors text-left border border-[#FF375F]/20"
              >
                <Trash2 size={16} className="text-[#FF375F] shrink-0" />
                <div className="flex-1">
                  <p className="text-[#FF375F] font-semibold text-sm">Remove and delete all data</p>
                  <p className="text-[#FF375F]/50 text-xs mt-0.5">Permanently deletes all logged sets — cannot be undone</p>
                </div>
              </button>
              <button
                onClick={() => setPendingRemove(null)}
                className="w-full py-3.5 rounded-2xl bg-white/5 text-white/50
                           hover:bg-white/8 transition-colors text-sm font-medium mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Goal editor sheet ── */}
      {pendingGoals && (
        <div className="absolute inset-0 z-20 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingGoals(null)} />
          <div className="relative w-full max-w-md bg-[#2c2c2e] rounded-t-3xl pt-5 pb-8 px-4 z-30">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-9 h-9 rounded-xl bg-[#007AFF]/15 flex items-center justify-center shrink-0">
                <Target size={18} className="text-[#007AFF]" />
              </div>
              <div>
                <p className="text-white font-semibold text-[15px]">{pendingGoals.name}</p>
                <p className="text-white/40 text-xs mt-0.5">Set your targets</p>
              </div>
            </div>

            <div className="space-y-5 px-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Max reps goal</p>
                  <p className="text-white/40 text-xs mt-0.5">Golden line on progress chart</p>
                </div>
                <Stepper value={goalMaxReps} onChange={setGoalMaxReps} min={0} max={999} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Sets per week</p>
                  <p className="text-white/40 text-xs mt-0.5">Activates streak counter</p>
                </div>
                <Stepper value={goalSetsPerWeek} onChange={setGoalSetsPerWeek} min={0} max={99} />
              </div>
            </div>

            <div className="flex gap-2 mt-7">
              <button
                onClick={() => setPendingGoals(null)}
                className="flex-1 py-3 rounded-2xl bg-white/8 text-white/60 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveGoals}
                className="flex-1 py-3 rounded-2xl bg-[#007AFF] text-white text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
