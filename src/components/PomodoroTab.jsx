// src/components/PomodoroTab.jsx
import { useState, useEffect, useRef } from 'react';
import { todayStr, fmtSecs } from '../utils/date';

const RC = 345; // ring circumference

export default function PomodoroTab({ habits, sessions, saveSessions }) {
  const [phase, setPhaseState] = useState('focus');
  const [running, setRunning] = useState(false);
  const [secsLeft, setSecsLeft] = useState(25 * 60);
  const [total, setTotal] = useState(25 * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [habitId, setHabitId] = useState('');
  const [settings, setSettings] = useState({ focus: 25, short: 5, long: 15, cycle: 4 });
  const timerRef = useRef(null);

  const phaseSecs = (ph) => ({ focus: settings.focus * 60, short: settings.short * 60, long: settings.long * 60 }[ph]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const setPhase = (ph) => {
    clearInterval(timerRef.current);
    setRunning(false);
    setPhaseState(ph);
    const s = phaseSecs(ph);
    setSecsLeft(s);
    setTotal(s);
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startSecs = secsLeft;
    timerRef.current = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          const mins = Math.round(startSecs / 60);
          const newSession = { date: todayStr(), type: phase, mins, startTime, habitId: habitId ? parseInt(habitId) : null };
          const next = [...sessions, newSession];
          saveSessions(next);
          if (phase === 'focus') {
            const nc = cycleCount + 1;
            setCycleCount(nc);
            const nextPhase = nc % settings.cycle === 0 ? 'long' : 'short';
            setTimeout(() => { setPhase(nextPhase); start(); }, 50);
          } else {
            setTimeout(() => setPhase('focus'), 50);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };
  const pause = () => { clearInterval(timerRef.current); setRunning(false); };
  const reset = () => { clearInterval(timerRef.current); setRunning(false); const s = phaseSecs(phase); setSecsLeft(s); setTotal(s); };
  const skip = () => setPhase({ focus: 'short', short: 'focus', long: 'focus' }[phase]);

  const pct = total > 0 ? secsLeft / total : 1;
  const dashoffset = Math.round(RC * (1 - pct));
  const ringColor = { focus: '#6c5ce7', short: '#1D9E75', long: '#378ADD' }[phase];

  const todaysSessions = sessions.filter(s => s.date === todayStr()).slice().reverse();
  const doneFocusToday = sessions.filter(s => s.date === todayStr() && s.type === 'focus').length;

  return (
    <div>
      <div className="psec">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Focus session</span>
          <select className="phsel" value={habitId} onChange={e => setHabitId(e.target.value)}>
            <option value="">No habit</option>
            {habits.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>)}
          </select>
        </div>
        <div className="ppills">
          <button className={phase === 'focus' ? 'ppill active' : 'ppill'} onClick={() => setPhase('focus')}>Focus</button>
          <button className={phase === 'short' ? 'ppill active' : 'ppill'} onClick={() => setPhase('short')}>Short break</button>
          <button className={phase === 'long' ? 'ppill active' : 'ppill'} onClick={() => setPhase('long')}>Long break</button>
        </div>
        <div className="pclock">
          <div className="pring">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="55" fill="none" strokeWidth="5" stroke="#2a2a38" />
              <circle cx="65" cy="65" r="55" fill="none" strokeWidth="5" stroke={ringColor} strokeLinecap="round"
                strokeDasharray={RC} strokeDashoffset={dashoffset} style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px' }} />
            </svg>
            <div className="ptime">
              <span>{fmtSecs(secsLeft)}</span>
              <span>{{ focus: 'Focus', short: 'Short break', long: 'Long break' }[phase]}</span>
            </div>
          </div>
        </div>
        <div className="pctrls">
          <button className="pctrl" onClick={reset}>↻</button>
          <button className="pctrl primary" onClick={running ? pause : start}>{running ? '⏸ Pause' : '▶ Start'}</button>
          <button className="pctrl" onClick={skip}>⏭</button>
        </div>
        <div className="pdots">
          {Array.from({ length: settings.cycle }, (_, i) => <div key={i} className={'pdot' + (i < doneFocusToday ? ' dp' : '')} />)}
        </div>
        <div className="psets">
          <div className="pset"><label>Focus (min)</label><input type="number" min="1" max="90" value={settings.focus} onChange={e => { const v = parseInt(e.target.value) || 25; setSettings(s => ({ ...s, focus: v })); if (!running && phase === 'focus') { setSecsLeft(v * 60); setTotal(v * 60); } }} /></div>
          <div className="pset"><label>Short break</label><input type="number" min="1" max="30" value={settings.short} onChange={e => { const v = parseInt(e.target.value) || 5; setSettings(s => ({ ...s, short: v })); if (!running && phase === 'short') { setSecsLeft(v * 60); setTotal(v * 60); } }} /></div>
          <div className="pset"><label>Long break</label><input type="number" min="1" max="60" value={settings.long} onChange={e => { const v = parseInt(e.target.value) || 15; setSettings(s => ({ ...s, long: v })); if (!running && phase === 'long') { setSecsLeft(v * 60); setTotal(v * 60); } }} /></div>
          <div className="pset"><label>Sessions</label><input type="number" min="2" max="8" value={settings.cycle} onChange={e => setSettings(s => ({ ...s, cycle: parseInt(e.target.value) || 4 }))} /></div>
        </div>
      </div>

      <div className="sec-hdr"><span className="sec-title">Today's sessions</span></div>
      {!todaysSessions.length && <div className="empty">No sessions today. Start a focus session above.</div>}
      {todaysSessions.map((s, i) => {
        const h = habits.find(x => x.id === s.habitId);
        const icon = h ? h.emoji : (s.type === 'focus' ? '🎯' : '☕');
        const color = h ? h.color : '#6c5ce7';
        return (
          <div className="session-log-item" key={i}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {s.type === 'focus' ? 'Focus' : s.type === 'short' ? 'Short break' : 'Long break'}{h ? ` — ${h.name}` : ''}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(240,238,255,0.4)' }}>{s.startTime} · {s.mins} min</div>
            </div>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
          </div>
        );
      })}
    </div>
  );
}
