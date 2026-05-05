import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  displayDate: string;
  isCurrentDay: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DayHeader({ displayDate, isCurrentDay, onPrev, onNext, onToday }: Props) {
  const swipeStartX = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 40) return;           // too short — treat as tap
    if (dx < 0) onNext();                     // swipe left  → forward in time
    else onPrev();                            // swipe right → back in time
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-3 select-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { swipeStartX.current = null; }}
    >
      <button
        onClick={onPrev}
        className="w-10 h-10 flex items-center justify-center rounded-full
                   hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={22} className="text-white/70" />
      </button>

      <button
        onClick={onToday}
        className="flex flex-col items-center gap-0.5 group"
        aria-label="Go to today"
        title="Tap to go to today"
      >
        <span className="text-lg font-semibold text-white tracking-tight">
          {displayDate}
        </span>
        {isCurrentDay ? (
          <span className="text-[11px] font-medium text-[#007AFF]">Today</span>
        ) : (
          <span className="text-[11px] text-white/30 group-hover:text-white/50 transition-colors">
            tap for today
          </span>
        )}
      </button>

      <button
        onClick={onNext}
        className="w-10 h-10 flex items-center justify-center rounded-full
                   hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight size={22} className="text-white/70" />
      </button>
    </div>
  );
}
