import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { TrendingUp, Activity, Zap } from 'lucide-react';

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

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white font-bold text-xl leading-tight">{value}</p>
        <p className="text-white/50 text-xs">{label}</p>
        {sub && <p className="text-white/30 text-[11px]">{sub}</p>}
      </div>
    </div>
  );
}

export function ProgressCharts() {
  const { exercises, logs } = useStore();
  const favorites = exercises.filter((e) => e.isFavorite);

  // Last 30 days volume per exercise
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });

  const perExerciseData = favorites.slice(0, 5).map((ex, i) => {
    const exLogs = logs.filter((l) => l.exerciseId === ex.id);
    const points = last30.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const dayLog = exLogs.find((l) => l.date === key);
      const totalReps = dayLog ? dayLog.sets.reduce((s, set) => s + set.reps, 0) : null;
      return { date: format(day, 'MMM d'), reps: totalReps };
    }).filter((p) => p.reps !== null);

    return { exercise: ex, data: points, color: COLORS[i % COLORS.length] };
  });

  // Weekly sets bar chart — last 8 weeks, i=0 oldest, i=7 current
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    const weekEnd = subDays(new Date(), weeksAgo * 7);
    const weekStart = subDays(weekEnd, 6);
    const label = format(weekStart, 'MMM d');
    const weekLogs = logs.filter((l) => {
      const d = parseISO(l.date);
      return d >= weekStart && d <= weekEnd;
    });
    const totalSets = weekLogs.reduce((s, l) => s + l.sets.length, 0);
    return { week: label, sets: totalSets };
  });

  // Summary stats
  const totalSets = logs.reduce((s, l) => s + l.sets.length, 0);
  const trainingDays = new Set(logs.map((l) => l.date)).size;
  const maxReps = logs.reduce((max, l) =>
    Math.max(max, ...l.sets.map((s) => s.reps)), 0);

  const hasAnyData = logs.length > 0;

  return (
    <div className="space-y-5 px-4 pb-8">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <StatCard
          label="Total sets"
          value={totalSets}
          icon={<Activity size={18} className="text-[#007AFF]" />}
        />
        <StatCard
          label="Training days"
          value={trainingDays}
          icon={<TrendingUp size={18} className="text-[#30D158]" />}
        />
        <StatCard
          label="Best set"
          value={maxReps > 0 ? `${maxReps}` : '—'}
          sub="reps"
          icon={<Zap size={18} className="text-[#FF9F0A]" />}
        />
      </div>

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
          {/* Weekly volume bar chart */}
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-white font-semibold mb-4 text-sm">Sets per week</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sets" fill="#007AFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-exercise line charts */}
          {perExerciseData
            .filter((d) => d.data.length > 1)
            .map(({ exercise, data, color }) => (
              <div key={exercise.id} className="bg-[#1c1c1e] rounded-2xl p-4">
                <p className="text-white font-semibold mb-4 text-sm">{exercise.name} — reps over time</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="reps"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
