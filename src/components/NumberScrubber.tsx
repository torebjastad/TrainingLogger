import { useRef, useState, useCallback } from 'react';

interface Props {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function NumberScrubber({ value, onChange, min = 1, max = 999 }: Props) {
  const startX = useRef<number | null>(null);
  const startVal = useRef(value);
  const [dragging, setDragging] = useState(false);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      startX.current = e.clientX;
      startVal.current = value;
    },
    [value]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (startX.current === null) return;
      const delta = e.clientX - startX.current;
      if (!dragging && Math.abs(delta) > 3) setDragging(true);
      const step = Math.round(delta / 8);
      const next = clamp(startVal.current + step);
      if (next !== value) {
        onChange(next);
        if ('vibrate' in navigator) navigator.vibrate(1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, min, max, dragging]
  );

  const onPointerUp = useCallback(() => {
    startX.current = null;
    setDragging(false);
  }, []);

  return (
    <div
      className="flex items-center gap-0.5 select-none"
      style={{ touchAction: 'none' }}
      data-no-swipe="true"
    >
      <button
        className="w-7 h-11 rounded-l-xl flex items-center justify-center text-white/50
                   hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors text-xl leading-none"
        onClick={() => onChange(clamp(value - 1))}
        aria-label="decrease"
      >
        −
      </button>

      {/* Drag target — primary interaction */}
      <div
        className="relative flex items-center justify-center cursor-ew-resize touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label={`${value} reps, drag to adjust`}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      >
        <div
          className={`min-w-[3rem] h-11 border-y flex items-center justify-center px-2 transition-colors
                      ${dragging
                        ? 'bg-[#007AFF]/25 border-[#007AFF]/50'
                        : 'bg-white/10 border-white/15 hover:bg-white/15 active:bg-white/20'}`}
        >
          <span className="text-xl font-semibold tabular-nums text-white tracking-tight">
            {value}
          </span>
        </div>
      </div>

      <button
        className="w-7 h-11 rounded-r-xl flex items-center justify-center text-white/50
                   hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors text-xl leading-none"
        onClick={() => onChange(clamp(value + 1))}
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}
