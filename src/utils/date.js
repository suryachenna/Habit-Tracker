// src/utils/date.js
export function todayBase() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dateStr(d) {
  return d.toISOString().split('T')[0];
}

export function todayStr() {
  return dateStr(todayBase());
}

export function dayActive(habit, dateString) {
  const dow = new Date(dateString + 'T00:00:00').getDay();
  if (habit.freq === 'Daily') return true;
  if (habit.freq === 'Weekdays') return dow >= 1 && dow <= 5;
  if (habit.freq === 'Weekends') return dow === 0 || dow === 6;
  if (habit.freq === 'Custom') return Array.isArray(habit.customDays) && habit.customDays.includes(dow);
  return true;
}

export const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAY_INITIALS = ['S','M','T','W','T','F','S'];
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function calcStreak(habit) {
  let s = 0;
  let d = todayBase();
  while (true) {
    const k = dateStr(d);
    if (!dayActive(habit, k)) { d.setDate(d.getDate() - 1); continue; }
    if (habit.completions && habit.completions[k]) { s++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return s;
}

export function freqLabel(habit) {
  if (habit.freq === 'Custom' && Array.isArray(habit.customDays)) {
    if (!habit.customDays.length) return 'No days set';
    if (habit.customDays.length === 7) return 'Every day';
    return [...habit.customDays].sort().map(d => DAY_SHORT[d]).join(', ');
  }
  return habit.freq;
}

export function fmtMins(m) {
  if (m >= 60) {
    const h = Math.floor(m / 60), mn = m % 60;
    return mn ? `${h}h ${mn}m` : `${h}h`;
  }
  return `${m}m`;
}

export function fmtSecs(s) {
  const m = Math.floor(s / 60), sc = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
}
