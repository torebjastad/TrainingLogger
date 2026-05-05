import { useState, lazy, Suspense, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { DayHeader } from './components/DayHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { AddExerciseModal } from './components/AddExerciseModal';
import { GoalSplash } from './components/GoalSplash';
import { TabNav } from './components/TabNav';
import { useStore } from './store/useStore';
import { useDate } from './hooks/useDate';

// Defer Recharts (~400 kB) until the Progress tab is opened
const ProgressCharts = lazy(() =>
  import('./components/ProgressCharts').then((m) => ({ default: m.ProgressCharts }))
);

type Tab = 'workout' | 'progress';
type SlideDir = 'from-right' | 'from-left' | null;

export default function App() {
  const [tab, setTab] = useState<Tab>('workout');
  const [slideDir, setSlideDir] = useState<SlideDir>(null);
  const [showModal, setShowModal] = useState(false);
  const [splash, setSplash] = useState<{ exerciseName: string; streak: number } | null>(null);
  const handleGoalReached = useCallback(
    (info: { exerciseName: string; streak: number }) => setSplash(info),
    []
  );
  const { exercises, getLogsForDate } = useStore();
  const { dateKey, displayDate, isCurrentDay, prev, next, goToday } = useDate();

  const favorites = exercises.filter((e) => e.isFavorite);
  const dayLogs = getLogsForDate(dateKey);

  const switchTab = (next: Tab) => {
    setSlideDir(next === 'progress' ? 'from-right' : 'from-left');
    setTab(next);
  };

  const mainClass = `flex-1 overflow-y-auto pb-28 ${
    slideDir === 'from-right' ? 'anim-slide-right' :
    slideDir === 'from-left'  ? 'anim-slide-left'  : ''
  }`;

  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

        {/* App header */}
        <header className="pt-safe">
          {tab === 'workout' && (
            <DayHeader
              displayDate={displayDate}
              isCurrentDay={isCurrentDay}
              onPrev={prev}
              onNext={next}
              onToday={goToday}
            />
          )}
          {tab === 'progress' && (
            <div className="px-4 pt-5 pb-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">Progress</h2>
              <p className="text-white/40 text-sm">Your training history</p>
            </div>
          )}
        </header>

        {/* Workout tab */}
        {tab === 'workout' && (
          <main
            className={mainClass}
            onAnimationEnd={() => setSlideDir(null)}
          >
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="text-5xl mb-4">💪</div>
                <p className="text-white/60 font-semibold text-lg">No favorites yet</p>
                <p className="text-white/30 text-sm mt-2 mb-6">
                  Add exercises to your favorites to start logging.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#007AFF] rounded-2xl
                             text-white font-semibold text-sm"
                >
                  <Plus size={18} />
                  Add exercises
                </button>
              </div>
            ) : (
              <div className="space-y-3 px-4 pt-2">
                {favorites.map((ex) => {
                  const log = dayLogs.find((l) => l.exerciseId === ex.id);
                  return (
                    <ExerciseCard
                      key={`${ex.id}-${dateKey}`}
                      exercise={ex}
                      dateKey={dateKey}
                      sets={log?.sets ?? []}
                      onGoalReached={handleGoalReached}
                    />
                  );
                })}
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                             border border-dashed border-white/15 text-white/40 hover:text-white/60
                             hover:border-white/25 transition-colors text-sm font-medium mt-1"
                >
                  <Plus size={16} />
                  Add / manage exercises
                </button>
              </div>
            )}
          </main>
        )}

        {/* Progress tab */}
        {tab === 'progress' && (
          <main
            className={mainClass}
            onAnimationEnd={() => setSlideDir(null)}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-16 text-white/30 text-sm">
                  Loading charts…
                </div>
              }
            >
              <ProgressCharts />
            </Suspense>
          </main>
        )}
      </div>

      <TabNav active={tab} onChange={switchTab} />

      {showModal && <AddExerciseModal onClose={() => setShowModal(false)} />}
      {splash && (
        <GoalSplash
          exerciseName={splash.exerciseName}
          streak={splash.streak}
          onDismiss={() => setSplash(null)}
        />
      )}
    </div>
  );
}
