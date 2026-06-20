// src/components/HabitsTab.jsx
import { useState, useMemo } from 'react';
import {
  todayBase, dateStr, todayStr, dayActive, calcStreak, freqLabel,
  fmtMins, DAY_SHORT, DAY_NAMES, MONTH_NAMES, DAY_INITIALS,
} from '../utils/date';

function habitFocusOn(sessions, habitId, date) {
  return sessions.filter(s => s.date === date && s.habitId === habitId && s.type === 'focus')
    .reduce((a, s) => a + s.mins, 0);
}
function focusOn(sessions, date) {
  return sessions.filter(s => s.date === date && s.type === 'focus').reduce((a, s) => a + s.mins, 0);
}

export default function HabitsTab({ habits, sessions, saveHabits, curDate, setCurDate, onAddHabit, onEditHabit, onStartPomo }) {
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalDraft, setGoalDraft] = useState({ val: 30, unit: 'min' });
  const [calOpen, setCalOpen] = useState(false);
  const [calY, setCalY] = useState(curDate.getFullYear());
  const [calM, setCalM] = useState(curDate.getMonth());

  const cur = dateStr(curDate);
  const today = todayStr();

  const activeHabits = habits.filter(h => dayActive(h, cur));
  const doneHabits = activeHabits.filter(h => h.completions && h.completions[cur]);
  const pct = activeHabits.length ? Math.round(doneHabits.length / activeHabits.length * 100) : 0;
  const bestStreak = habits.reduce((m, h) => Math.max(m, calcStreak(h)), 0);
  const focusMins = focusOn(sessions, cur);

  const goToDate = (ds) => setCurDate(new Date(ds + 'T00:00:00'));
  const shiftDay = (delta) => { const d = new Date(curDate); d.setDate(d.getDate() + delta); setCurDate(d); };

  const navLabel = useMemo(() => {
    const yest = new Date(todayBase()); yest.setDate(yest.getDate() - 1);
    const tom = new Date(todayBase()); tom.setDate(tom.getDate() + 1);
    if (cur === today) return 'Today';
    if (cur === dateStr(yest)) return 'Yesterday';
    if (cur === dateStr(tom)) return 'Tomorrow';
    return DAY_NAMES[curDate.getDay()];
  }, [cur, today, curDate]);

  const strip = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(curDate); d.setDate(d.getDate() + i);
    strip.push(d);
  }

  const toggleComplete = (habitId) => {
    const h = habits.find(x => x.id === habitId);
    if (!h || !dayActive(h, cur)) return;
    const completions = { ...(h.completions || {}) };
    if (completions[cur]) delete completions[cur]; else completions[cur] = true;
    saveHabits(habits.map(x => x.id === habitId ? { ...x, completions } : x));
  };

  const deleteHabit = (habitId) => saveHabits(habits.filter(h => h.id !== habitId));

  const startGoalEdit = (h) => {
    const hasGoal = h.goalMins > 0;
    const isHr = hasGoal && h.goalMins >= 60 && h.goalMins % 60 === 0;
    setGoalDraft({ val: hasGoal ? (isHr ? h.goalMins / 60 : h.goalMins) : 30, unit: isHr ? 'hr' : 'min' });
    setEditingGoalId(h.id);
  };
  const saveGoal = (habitId) => {
    let mins = Math.round(goalDraft.unit === 'hr' ? goalDraft.val * 60 : goalDraft.val);
    saveHabits(habits.map(h => h.id === habitId ? { ...h, goalMins: Math.max(0, mins) } : h));
    setEditingGoalId(null);
  };

  // calendar picker
  const openCal = () => { setCalY(curDate.getFullYear()); setCalM(curDate.getMonth()); setCalOpen(o => !o); };
  const firstDay = new Date(calY, calM, 1).getDay();
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const calCells = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  return (
    <div>
      <div className="dnav">
        <button className="dnav-btn" onClick={() => shiftDay(-1)}>←</button>
        <div className="dnav-center">
          <span className="dnav-date">
            {navLabel}
            {cur !== today && <span className="today-chip" onClick={() => goToDate(today)}>Today</span>}
          </span>
          <span className="dnav-sub">{curDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          {calOpen && (
            <div className="dpicker">
              <div className="dpicker-head">
                <button onClick={() => { let m = calM - 1, y = calY; if (m < 0) { m = 11; y--; } setCalM(m); setCalY(y); }}>←</button>
                <span>{MONTH_NAMES[calM]} {calY}</span>
                <button onClick={() => { let m = calM + 1, y = calY; if (m > 11) { m = 0; y++; } setCalM(m); setCalY(y); }}>→</button>
              </div>
              <div className="dpicker-days-hdr">{DAY_INITIALS.map((l, i) => <span key={i}>{l}</span>)}</div>
              <div className="dpicker-grid">
                {calCells.map((d, i) => {
                  if (!d) return <div className="dpicker-cell" key={i} />;
                  const ds = dateStr(new Date(calY, calM, d));
                  return (
                    <div
                      key={i}
                      className={'dpicker-cell' + (ds === today ? ' today-cell' : '') + (ds === cur ? ' selected-cell' : '')}
                      onClick={() => { goToDate(ds); setCalOpen(false); }}
                    >{d}</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button className="dnav-btn" onClick={() => shiftDay(1)}>→</button>
      </div>
      <button className="jump-date-btn" onClick={openCal}>📅 Jump to date</button>

      <div className="daystrip">
        {strip.map((d, i) => {
          const ds = dateStr(d);
          const isSel = ds === cur;
          const isToday = ds === today;
          const isFuture = ds > today;
          const ah = habits.filter(h => dayActive(h, ds));
          const dh = ah.filter(h => h.completions && h.completions[ds]);
          const dotClass = isFuture ? '' : ah.length === 0 ? '' : dh.length === ah.length ? ' done-all' : dh.length > 0 ? ' done-some' : '';
          return (
            <div
              key={i}
              className={'ds-item' + (isSel ? ' active-day' : '') + (isToday && !isSel ? ' today-strip' : '')}
              onClick={() => goToDate(ds)}
            >
              <span className="ds-lbl">{DAY_SHORT[d.getDay()].slice(0, 2)}</span>
              <span className="ds-num">{d.getDate()}</span>
              <div className={'ds-dot' + dotClass} />
            </div>
          );
        })}
      </div>

      <div className="stats-row">
        <div className="stat"><span className="stat-num">{habits.length}</span><span className="stat-label">Habits</span></div>
        <div className="stat"><span className="stat-num">{pct}%</span><span className="stat-label">Done</span></div>
        <div className="stat"><span className="stat-num">{bestStreak} 🔥</span><span className="stat-label">Best streak</span></div>
        <div className="stat"><span className="stat-num">{focusMins >= 60 ? `${Math.round(focusMins/60*10)/10}h` : `${focusMins}m`}</span><span className="stat-label">Focus</span></div>
      </div>

      <div className="sec-hdr">
        <span className="sec-title">My habits</span>
        <button className="add-btn" onClick={onAddHabit}>+ Add habit</button>
      </div>

      {cur > today && <div className="future-banner">📆 Future date — plan ahead!</div>}

      {!habits.length && <div className="empty">No habits yet. Add one above.</div>}

      <div className="habits-grid">
        {habits.map(h => {
          const active = dayActive(h, cur);
          const done = !!(h.completions && h.completions[cur]);
          const sk = calcStreak(h);
          const lm = habitFocusOn(sessions, h.id, cur);
          const hasGoal = h.goalMins > 0;
          const gp = hasGoal ? Math.min(100, Math.round(lm / h.goalMins * 100)) : 0;
          const isEditingGoal = editingGoalId === h.id;

          return (
            <div className="hcard" key={h.id}>
              <div className="htop">
                <div className="hicon" style={{ background: h.color + '25' }}>{h.emoji}</div>
                <div className="hinfo">
                  <div className="hname">{h.name}</div>
                  <div className="hmeta">{freqLabel(h)}</div>
                </div>
                <div className="hright">
                  <span className="hstreak">{sk} 🔥</span>
                  <button className="pbtn" onClick={() => onStartPomo(h.id)}>⏲ Focus</button>
                </div>
                <div className="hactions">
                  <button className="ibtn" onClick={() => onEditHabit(h)}>✎</button>
                  <button className="ibtn danger" onClick={() => deleteHabit(h.id)}>🗑</button>
                </div>
              </div>

              <button
                className={'big-check' + (done ? ' checked' : '') + (!active ? ' inactive' : '')}
                onClick={() => toggleComplete(h.id)}
                disabled={!active}
              >
                {!active ? 'Not scheduled' : done ? '✓ Completed — tap to undo' : 'Mark as done'}
              </button>

              {hasGoal && (
                <div className="pbar"><div className="pfill" style={{ width: gp + '%', background: h.color }} /></div>
              )}

              {isEditingGoal ? (
                <div className="trow">
                  <span className="tlogged">Goal:</span>
                  <input
                    className="geinp" type="number" min="1" max="24" step="0.5"
                    value={goalDraft.val}
                    onChange={e => setGoalDraft(d => ({ ...d, val: parseFloat(e.target.value) || 0 }))}
                  />
                  <select className="gusel" value={goalDraft.unit} onChange={e => setGoalDraft(d => ({ ...d, unit: e.target.value }))}>
                    <option value="min">min</option>
                    <option value="hr">hr</option>
                  </select>
                  <button className="gsbtn" onClick={() => saveGoal(h.id)}>✓</button>
                  <button className="gsbtn" onClick={() => setEditingGoalId(null)}>✕</button>
                </div>
              ) : (
                <div className="trow">
                  <span className="tlogged">⏱ {hasGoal ? `${fmtMins(lm)} / ${fmtMins(h.goalMins)}` : 'No goal'}</span>
                  {hasGoal && <span style={{ fontSize: 10, color: 'rgba(240,238,255,0.4)' }}>{gp}%</span>}
                  <button className="gdsp" onClick={() => startGoalEdit(h)}>{hasGoal ? 'Edit' : 'Set goal'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
