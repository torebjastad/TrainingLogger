import { useState, useEffect } from 'react';
import { X, Plus, Star } from 'lucide-react';
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

export function AddExerciseModal({ onClose }: Props) {
  const { exercises, toggleFavorite, addExercise } = useStore();
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<Exercise['category']>('other');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const nonFavorites = exercises.filter((e) => !e.isFavorite);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addExercise(trimmed, newCat);
    setNewName('');
    setShowNew(false);
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
        {/* Handle */}
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

        {/* Currently favorited — option to remove */}
        {exercises.filter((e) => e.isFavorite).length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium px-1 mb-3">
              Your favorites
            </p>
            <div className="space-y-2">
              {exercises
                .filter((e) => e.isFavorite)
                .map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => toggleFavorite(ex.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                               bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium text-sm flex-1">{ex.name}</span>
                    <span className="text-[11px] text-white/30">tap to remove</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
