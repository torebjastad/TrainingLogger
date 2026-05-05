# TrainingLogger — Claude Code Workspace

## Project overview

A minimal, client-side workout tracker built for quick, low-friction logging of bodyweight training sets. Primary use case: hangboard / calisthenics. Data persists entirely in `localStorage` via Zustand `persist` middleware — no backend.

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React 18 + TypeScript | ^18.3 |
| Build | Vite | ^6 |
| Styling | Tailwind CSS v4 (Vite plugin) | ^4.2 |
| State | Zustand (persist middleware) | ^5 |
| Charts | Recharts | ^2 |
| Dates | date-fns | ^4 |
| Icons | Lucide React | ^0.500 |

## Folder structure

```
src/
  components/          # UI components
    DayHeader.tsx      # Date nav with < > arrows
    ExerciseCard.tsx   # Favorite exercise with inline logging
    NumberScrubber.tsx # Drag-to-set reps widget
    AddExerciseModal.tsx
    ProgressCharts.tsx # Recharts progress view
    TabNav.tsx         # Bottom tab bar
  store/
    useStore.ts        # Single Zustand store (exercises + logs)
  types/
    index.ts           # Exercise, LoggedSet, DayLog interfaces
  hooks/
    useDate.ts         # Current date navigation state
  utils/
    dateUtils.ts       # date-fns helpers
  App.tsx
  main.tsx
  index.css            # Tailwind @import + CSS vars
```

## Data model

```typescript
Exercise  { id, name, category, isFavorite, defaultReps }
LoggedSet { id, reps, timestamp }
DayLog    { date: "YYYY-MM-DD", exerciseId, sets: LoggedSet[] }
```

All stored in `localStorage` key `training-logger-v1`.

## Key UX flows

**Log a set:**
1. Main tab shows today's date with ← → nav
2. Favorite exercises listed as cards
3. Each card has a **NumberScrubber** — drag L/R to adjust reps, or tap +/−
4. Tap ✓ to commit the set; it appears as a chip below
5. Rep count stays for the next consecutive set (pre-filled)

**Manage favorites:**
- Tap ＋ button to open exercise picker modal
- Toggle favorites inline — un-favorited exercises hide from main view

**Progress tab:**
- Per-exercise line charts (reps over time)
- Total sets per week bar chart
- Summary cards: total sets, max reps, training days

## Development commands

```bash
npm run dev      # Vite dev server — http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Extending exercises

Add entries to `DEFAULT_EXERCISES` in `src/store/useStore.ts`. Categories: `pulling | pushing | core | legs | other`.

## Design language

- Dark theme (`#0f0f0f` base, `#1c1c1e` surface, `#2c2c2e` elevated)
- Accent blue `#007AFF` (iOS-style), confirm green `#30D158`
- Rounded corners `rounded-2xl`, generous padding
- All interactive targets ≥ 44px (WCAG touch target)
- Smooth 150ms transitions on interactive elements
