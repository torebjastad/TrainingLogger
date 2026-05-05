import { useEffect } from 'react';

interface Props {
  exerciseName: string;
  streak: number;
  onDismiss: () => void;
}

export function GoalSplash({ exerciseName, streak, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[#1c1c1e] rounded-3xl px-8 py-8 text-center max-w-xs w-full
                      border border-[#FF9F0A]/25 shadow-2xl shadow-black/60 anim-splash">
        <div className="text-5xl mb-3 leading-none">🔥</div>
        <p className="text-[#FF9F0A] font-bold text-[17px] mb-1">Weekly goal reached!</p>
        <p className="text-white font-semibold text-sm mb-4">{exerciseName}</p>
        {streak > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-[#FF9F0A]/15 rounded-full px-4 py-1.5">
            <span className="text-[#FF9F0A] font-bold text-sm">
              {streak} week{streak !== 1 ? 's' : ''} in a row
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
