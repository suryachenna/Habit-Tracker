// src/components/ReportsTab.jsx
import { useState, useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip,
} from 'chart.js';
import {
  todayBase, dateStr, todayStr, dayActive, DAY_SHORT, DAY_NAMES, fmtMins,
} from '../utils/date';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip);

function last(n, fn) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(todayBase());
    d.setDate(d.getDate() - i);
    out.push(fn(dateStr(d), d));
  }
  return out;
}
function focusOn(sessions, date) {
  return sessions.filter(s => s.date === date && s.type === 'focus').reduce((a, s) => a + s.mins, 0);
}
function habitFocusOn(sessions, habitId, date) {
  return sessions.filter(s => s.date === date && s.habitId === habitId && s.type === 'focus').reduce((a, s) => a + s.mins, 0);
}

const tickColor = 'rgba(240,238,255,0.4)';
const gridColor = 'rgba(255,255,255,0.06)';
const baseOpts = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
  plugins: { legend: { display: false } },
};

export default function ReportsTab({ habits, sessions, onOpenDay }) {
  const [openDates, setOpenDates] = useState(() => new Set([todayStr()]));
  const [chartHabitId, setChartHabitId] = useState(habits[0]?.id ?? '');

  const weekly = useMemo(() => last(7, (ds, d) => {
    const ah = habits.filter(h => dayActive(h, ds));
    const dh = ah.filter(h => h.completions && h.completions[ds]);
    return { label: DAY_SHORT[d.getDay()], pct: ah.length ? Math.round(dh.length / ah.length * 100) : 0 };
  }), [habits]);

  const focus14 = useMemo(() => last(14, (ds, d) => ({
    label: `${d.getMonth() + 1}/${d.getDate()}`, mins: focusOn(sessions, ds),
  })), [sessions]);

  const habitId = chartHabitId || habits[0]?.id;
  const habitChartData = useMemo(() => {
    const h = habits.find(x => x.id === habitId);
    if (!h) return null;
    return last(14, (ds, d) => {
      const active = dayActive(h, ds);
      const done = h.completions && h.completions[ds];
      return { label: `${d.getMonth() + 1}/${d.getDate()}`, val: active ? (done ? 1 : 0.1) : 0, done, active, color: h.color };
    });
  }, [habits, habitId]);

  const earliest = habits.reduce((m, h) => h.created && h.created < m ? h.created : m, todayStr());
  const allDates = [];
  {
    let d = new Date(todayBase()); d.setDate(d.getDate() + 7);
    const startD = new Date(earliest + 'T00:00:00');
    while (d >= startD) { allDates.push(dateStr(d)); d.setDate(d.getDate() - 1); }
  }
  const yesterday = (() => { const y = new Date(todayBase()); y.setDate(y.getDate() - 1); return dateStr(y); })();

  const toggleOpen = (date) => setOpenDates(s => { const n = new Set(s); n.has(date) ? n.delete(date) : n.add(date); return n; });

  if (!habits.length) return <div className="empty">No habits yet.</div>;

  return (
    <div>
      <div className="chartcard">
        <h3>Weekly completion %</h3>
        <div style={{ position: 'relative', height: 160 }}>
          <Bar
            data={{ labels: weekly.map(w => w.label), datasets: [{ data: weekly.map(w => w.pct), backgroundColor: weekly.map(w => w.pct === 100 ? 'rgba(29,158,117,0.65)' : w.pct > 0 ? 'rgba(108,92,231,0.55)' : 'rgba(255,255,255,0.06)'), borderRadius: 4 }] }}
            options={{ ...baseOpts, scales: { y: { min: 0, max: 100, ticks: { color: tickColor, callback: v => v + '%' }, grid: { color: gridColor }, border: { display: false } }, x: { ticks: { color: tickColor }, grid: { display: false }, border: { display: false } } }, plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: c => c.parsed.y + '%' } } } }}
          />
        </div>
      </div>

      <div className="chartcard">
        <h3>Focus time — last 14 days</h3>
        <div style={{ position: 'relative', height: 160 }}>
          <Line
            data={{ labels: focus14.map(f => f.label), datasets: [{ data: focus14.map(f => f.mins), borderColor: '#6c5ce7', backgroundColor: 'rgba(108,92,231,0.08)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#6c5ce7', pointBorderColor: 'transparent' }] }}
            options={{ ...baseOpts, scales: { y: { min: 0, ticks: { color: tickColor, callback: v => v + 'm' }, grid: { color: gridColor }, border: { display: false } }, x: { ticks: { color: tickColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 }, grid: { display: false }, border: { display: false } } }, plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: c => fmtMins(c.parsed.y) } } } }}
          />
        </div>
      </div>

      <div className="chartcard">
        <h3>Habit streak — last 14 days</h3>
        <select className="habitsel" value={habitId} onChange={e => setChartHabitId(parseInt(e.target.value))}>
          {habits.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
        </select>
        {habitChartData && (
          <div style={{ position: 'relative', height: 140 }}>
            <Bar
              data={{ labels: habitChartData.map(d => d.label), datasets: [{ data: habitChartData.map(d => d.val), backgroundColor: habitChartData.map(d => d.done ? d.color + 'bb' : d.active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)'), borderRadius: 3 }] }}
              options={{ ...baseOpts, scales: { y: { min: 0, max: 1, display: false }, x: { ticks: { color: tickColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 }, grid: { display: false }, border: { display: false } } }, plugins: { ...baseOpts.plugins, tooltip: { callbacks: { label: c => { const x = habitChartData[c.dataIndex]; return x.active ? (x.done ? 'Done' : 'Missed') : 'Not scheduled'; } } } } }}
            />
          </div>
        )}
      </div>

      <div className="sec-hdr" style={{ marginTop: 14 }}>
        <span className="sec-title">Daily history</span>
        <span style={{ fontSize: 11, color: 'rgba(240,238,255,0.3)' }}>Tap to expand</span>
      </div>

      {allDates.map(date => {
        const isToday = date === todayStr();
        const isYesterday = date === yesterday;
        const isFuture = date > todayStr();
        const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : `${DAY_NAMES[new Date(date + 'T00:00:00').getDay()]}, ${date.slice(5).replace('-', '/')}`;
        const ah = habits.filter(h => dayActive(h, date));
        const dh = ah.filter(h => h.completions && h.completions[date]);
        const pct = ah.length ? Math.round(dh.length / ah.length * 100) : 0;
        const fm = focusOn(sessions, date);
        const bc = isFuture ? '#a78bfa' : pct === 100 ? '#1D9E75' : pct >= 50 ? '#EF9F27' : '#E24B4A';
        const open = openDates.has(date) || isToday || isYesterday;

        return (
          <div className="rday" key={date}>
            <div className="rday-hdr" onClick={() => toggleOpen(date)}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {label}{isFuture && <span style={{ fontSize: 10, color: '#c4b5fd', padding: '1px 6px', background: 'rgba(108,92,231,0.12)', borderRadius: 20, marginLeft: 6 }}>future</span>}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(240,238,255,0.4)', marginTop: 2 }}>
                  {dh.length}/{ah.length} habits{fm ? ` · ${fmtMins(fm)} focus` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: bc + '20', color: bc, border: `1px solid ${bc}40` }}>{isFuture ? '—' : pct + '%'}</span>
                <span style={{ fontSize: 13, color: 'rgba(240,238,255,0.3)' }}>{open ? '▴' : '▾'}</span>
              </div>
            </div>
            {open && (
              <div className="rday-body">
                <div className="rstats">
                  <div className="rstat"><span className="rstat-n">{dh.length}/{ah.length}</span><span className="rstat-l">Done</span></div>
                  <div className="rstat"><span className="rstat-n">{fm ? fmtMins(fm) : '—'}</span><span className="rstat-l">Focus</span></div>
                </div>
                {ah.map(h => {
                  const done = h.completions && h.completions[date];
                  const hfm = habitFocusOn(sessions, h.id, date);
                  return (
                    <div className="rrow" key={h.id}>
                      <span style={{ fontSize: 13 }}>{h.emoji}</span>
                      <span style={{ fontSize: 12, flex: 1 }}>{h.name}</span>
                      {hfm > 0 && <span style={{ fontSize: 10, color: 'rgba(240,238,255,0.35)' }}>{fmtMins(hfm)}</span>}
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: done ? 'rgba(29,158,117,0.15)' : isFuture ? 'rgba(108,92,231,0.1)' : 'rgba(226,75,74,0.12)', color: done ? '#34d399' : isFuture ? '#c4b5fd' : '#F09595' }}>
                        {done ? 'Done' : isFuture ? 'Planned' : 'Missed'}
                      </span>
                    </div>
                  );
                })}
                {!isFuture && ah.length > 0 && (
                  <div className="rpbar"><div style={{ height: '100%', borderRadius: 2, width: pct + '%', background: bc }} /></div>
                )}
                <button className="open-day-btn" onClick={() => onOpenDay(new Date(date + 'T00:00:00'))}>Open this day</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
