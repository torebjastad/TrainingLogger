import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays, addDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { computeWeeklyStreak, weekBounds } from '../utils/streaks';

const COLORS = ['#007AFF', '#30D158', '#FF9F0A', '#BF5AF2', '#FF375F'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function medianOf(reps: number[]): number {
  const sorted = [...reps].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10
    : sorted[mid];
}

// Linear-regression slope of `value` over time, expressed as reps/week.
// Returns null when there aren't enough distinct points to fit a line.
function slopePerWeek(points: { date: string; value: number }[]): number | null {
  if (points.length < 2) return null;
  const firstMs = parseISO(points[0].date).getTime();
  const xs = points.map((p) => (parseISO(p.date).getTime() - firstMs) / 86_400_000);
  const ys = points.map((p) => p.value);
  const n = points.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return 0;
  return (num / den) * 7;
}

function formatSlope(s: number | null): string {
  if (s === null) return '—';
  const r = Math.round(s * 10) / 10;
  if (r === 0) return '0';
  return r > 0 ? `+${r.toFixed(1)}` : r.toFixed(1);
}

function slopeTextClass(s: number | null): string {
  if (s === null || Math.abs(s) < 0.05) return 'text-white/55';
  return s > 0 ? 'text-[#30D158]' : 'text-[#FF9F0A]';
}

export function ProgressCharts() {
  const exercises = useStore((s) => s.exercises);
  const logs = useStore((s) => s.logs);
  const favorites = useMemo(() => exercises.filter((e) => e.isFavorite), [exercises]);

  const { perExerciseData, weeklyData, activeFavorites } = useMemo(() => {
    const now = new Date();
    const last30 = eachDayOfInterval({ start: subDays(now, 29), end: now });

    const perExerciseData = favorites.slice(0, 5).map((ex, i) => {
      const exLogs = logs
        .filter((l) => l.exerciseId === ex.id && l.sets.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date));

      const points = last30
        .map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayLog = exLogs.find((l) => l.date === key);
          if (!dayLog || dayLog.sets.length === 0) return null;

          const sorted = [...dayLog.sets.map((s) => s.reps)].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median =
            sorted.length % 2 === 0
              ? Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10
              : sorted[mid];
          const max = sorted[sorted.length - 1];

          return { date: format(day, 'MMM d'), median, max };
        })
        .filter((p): p is { date: string; median: number; max: number } => p !== null);

      const pb = exLogs.reduce(
        (m, l) => Math.max(m, ...l.sets.map((s) => s.reps)),
        0
      );
      const sessions = exLogs.length;
      const recentMedian =
        exLogs.length > 0 ? medianOf(exLogs[exLogs.length - 1].sets.map((s) => s.reps)) : 0;

      const sessionPoints = exLogs.map((l) => {
        const reps = l.sets.map((s) => s.reps);
        return {
          date: l.date,
          max: Math.max(...reps),
          median: medianOf(reps),
        };
      });
      const maxSlope = slopePerWeek(
        sessionPoints.map((p) => ({ date: p.date, value: p.max }))
      );
      const medianSlope = slopePerWeek(
        sessionPoints.map((p) => ({ date: p.date, value: p.median }))
      );

      const streak = ex.goals?.setsPerWeek
        ? computeWeeklyStreak(ex.id, ex.goals.setsPerWeek, logs)
        : 0;

      return {
        exercise: ex,
        data: points,
        color: COLORS[i % COLORS.length],
        pb,
        sessions,
        recentMedian,
        maxSlope,
        medianSlope,
        streak,
      };
    });

    const activeFavorites = favorites.slice(0, 5);
    const thisWeek = weekBounds(now);
    const weeklyData = Array.from({ length: 8 }, (_, i) => {
      const weeksAgo = 7 - i;
      const weekStart = subDays(thisWeek.start, weeksAgo * 7);
      const weekEnd = addDays(weekStart, 6);
      const point: Record<string, string | number> = { week: format(weekStart, 'MMM d') };
      activeFavorites.forEach((ex) => {
        point[ex.id] = logs
          .filter((l) => {
            if (l.exerciseId !== ex.id) return false;
            const d = parseISO(l.date);
            return d >= weekStart && d <= weekEnd;
          })
          .reduce((s, l) => s + l.sets.length, 0);
      });
      return point;
    });

    return { perExerciseData, weeklyData, activeFavorites };
  }, [favorites, logs]);

  const hasAnyData = logs.length > 0;

  return (
    <div className="space-y-4 px-4 pb-8 pt-2">
      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-white/50 font-medium">No data yet</p>
          <p className="text-white/30 text-sm mt-1">
            Log some sets on the Workout tab to see your progress here.
          </p>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* Weekly volume */}
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-white font-semibold mb-4 text-sm">Sets per week</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {activeFavorites.map((ex, i) => (
                  <Bar
                    key={ex.id}
                    dataKey={ex.id}
                    name={ex.name}
                    stackId="a"
                    fill={COLORS[i % COLORS.length]}
                    radius={i === activeFavorites.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {activeFavorites.map((ex, i) => (
                <span key={ex.id} className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {ex.name}
                </span>
              ))}
            </div>
          </div>

          {/* Per-exercise cards */}
          {perExerciseData
            .filter((d) => d.sessions > 0)
            .map(({ exercise, data, color, pb, sessions, recentMedian, maxSlope, medianSlope, streak }) => (
              <div key={exercise.id} className="bg-[#1c1c1e] rounded-2xl p-4">
                {/* Title row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{exercise.name}</p>
                    {streak > 0 && (
                      <span className="text-[11px] font-bold text-[#FF9F0A]">🔥{streak}</span>
                    )}
                  </div>
                  {data.length > 1 && (
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-white/50">
                        <span className="inline-block w-4 h-0.5" style={{ background: color }} />
                        Max
                      </span>
                      <span className="flex items-center gap-1 text-white/50">
                        <span className="inline-block w-4 h-0.5 opacity-50" style={{ background: color }} />
                        Median
                      </span>
                      {exercise.goals?.maxReps && (
                        <span className="flex items-center gap-1 text-white/50">
                          <span className="inline-block w-4 h-0.5" style={{ background: '#FFD60A' }} />
                          Goal
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stat strip */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
                    <p className="text-white font-bold text-base leading-tight">{pb || '—'}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">PB</p>
                  </div>
                  <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
                    <p className="text-white font-bold text-base leading-tight">
                      {recentMedian || '—'}
                    </p>
                    <p className="text-white/40 text-[10px] mt-0.5">Now</p>
                  </div>
                  <div className="bg-white/5 rounded-xl px-2 py-2 text-center">
                    <p className="text-white font-bold text-base leading-tight">{sessions}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">Sessions</p>
                  </div>
                  {/* Trend: max & median rep change per week */}
                  <div
                    className={`rounded-xl px-1.5 py-2 text-center ${
                      maxSlope !== null && maxSlope > 0.1
                        ? 'bg-[#30D158]/10'
                        : maxSlope !== null && maxSlope < -0.1
                          ? 'bg-[#FF9F0A]/10'
                          : 'bg-white/5'
                    }`}
                  >
                    <p className="leading-tight">
                      <span className={`font-bold text-sm ${slopeTextClass(maxSlope)}`}>
                        {formatSlope(maxSlope)}
                      </span>
                      <span className="text-white/40 text-[9px] ml-1">max/wk</span>
                    </p>
                    <p className="leading-tight mt-1">
                      <span className={`font-bold text-sm ${slopeTextClass(medianSlope)}`}>
                        {formatSlope(medianSlope)}
                      </span>
                      <span className="text-white/40 text-[9px] ml-1">med/wk</span>
                    </p>
                  </div>
                </div>

                {/* Chart — only when 2+ data points */}
                {data.length > 1 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        domain={exercise.goals?.maxReps
                          ? [0, Math.ceil(Math.max(
                              ...data.flatMap((d) => [d.max, d.median]),
                              exercise.goals.maxReps * 1.15
                            ))]
                          : [0, 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {exercise.goals?.maxReps && (
                        <ReferenceLine
                          y={exercise.goals.maxReps}
                          stroke="#FFD60A"
                          strokeWidth={1.5}
                          strokeDasharray="6 3"
                          strokeOpacity={0.8}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="max"
                        name="Max"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="median"
                        name="Median"
                        stroke={color}
                        strokeWidth={1.5}
                        strokeOpacity={0.5}
                        strokeDasharray="5 3"
                        dot={{ fill: color, r: 2, opacity: 0.5 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/25 text-xs text-center py-4">
                    Log at least 2 sessions to see the chart
                  </p>
                )}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
