import { Dumbbell, TrendingUp } from 'lucide-react';

type Tab = 'workout' | 'progress';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

export function TabNav({ active, onChange }: Props) {
  const tabs: { id: Tab; label: string; Icon: typeof Dumbbell }[] = [
    { id: 'workout', label: 'Workout', Icon: Dumbbell },
    { id: 'progress', label: 'Progress', Icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="w-full max-w-md bg-[#1c1c1e]/90 backdrop-blur-xl border-t border-white/8
                      flex items-center justify-around px-8 pb-safe">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 py-3 px-6 transition-colors ${
              active === id ? 'text-[#007AFF]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon size={22} strokeWidth={active === id ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
