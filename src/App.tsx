import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DayHeader } from './components/DayHeader';
import { ExerciseCard } from './components/ExerciseCard';
import { AddExerciseModal } from './components/AddExerciseModal';
import { ProgressCharts } from './components/ProgressCharts';
import { TabNav } from './components/TabNav';
import { useStore } from './store/useStore';
import { useDate } from './hooks/useDate';

type Tab = 'workout' | 'progress';

export default function App() {
  const [tab, setTab] = useState<Tab>('workout');
  const [showModal, setShowModal] = useState(false);
  const { exercises, getLogsForDate } = useStore();
  const { dateKey, displayDate, isCurrentDay, prev, next, goToday } = useDate();

  const favorites = exercises.filter((e) => e.isFavorite);
  const dayLogs = getLogsForDate(dateKey);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* App header */}
        <header className="pt-safe">
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <h1 className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
              TrainingLogger
            </h1>
          </div>

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
            <div className="px-4 py-3">
              <h2 className="text-lg font-semibold text-white">Progress</h2>
              <p className="text-white/40 text-sm">Your training history</p>
            </div>
          )}
        </header>

        {/* Workout tab */}
        {tab === 'workout' && (
          <main className="flex-1 overflow-y-auto pb-28">
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
                    />
                  );
                })}

                {/* Add more exercises button */}
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
          <main className="flex-1 overflow-y-auto pb-28">
            <ProgressCharts />
          </main>
        )}
      </div>

      <TabNav active={tab} onChange={setTab} />

      {showModal && <AddExerciseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
