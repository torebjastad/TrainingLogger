import { useState } from 'react';
import { addDays, format, isToday } from 'date-fns';

export function useDate() {
  const [date, setDate] = useState(new Date());

  const prev = () => setDate((d) => addDays(d, -1));
  const next = () => setDate((d) => addDays(d, 1));
  const goToday = () => setDate(new Date());

  const dateKey = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'EEE, MMM d');
  const isCurrentDay = isToday(date);

  return { date, dateKey, displayDate, isCurrentDay, prev, next, goToday };
}
