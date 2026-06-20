// src/components/HabitModal.jsx
import { useState } from 'react';
import { DAY_INITIALS } from '../utils/date';

const EMOJIS = ['📚','🏋️','🧘','🏃','💊','💧','🥗','😴','✍️','🎸','🚴','🧹','🧠','💪','🛁','🎯','📖','🌿','🍎','☀️','🧘‍♂️','🏊'];
const COLORS = ['#ff6b6b','#1D9E75','#378ADD','#EF9F27','#a78bfa','#f472b6','#34d399','#fb923c','#94a3b8'];
const FREQ_OPTIONS = [
  { k: 'Daily', l: 'Every day' },
  { k: 'Weekdays', l: 'Weekdays' },
  { k: 'Weekends', l: 'Weekends' },
  { k: 'Custom', l: 'Custom days' },
];

export default function HabitModal({ habit, onClose, onSave }) {
  const isEdit = !!habit;
  const [name, setName] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || EMOJIS[0]);
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [freq, setFreq] = useState(habit?.freq || 'Daily');
  const [customDays, setCustomDays] = useState(habit?.customDays || [1, 2, 3, 4, 5]);
  const [goalVal, setGoalVal] = useState(habit?.goalMins ? (habit.goalMins % 60 === 0 ? habit.goalMins / 60 : habit.goalMins) : '');
  const [goalUnit, setGoalUnit] = useState(habit?.goalMins && habit.goalMins % 60 === 0 ? 'hr' : 'min');

  const toggleCustomDay = (d) => setCustomDays(days => days.includes(d) ? days.filter(x => x !== d) : [...days, d]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    let goalMins = parseInt(goalVal) || 0;
    if (goalUnit === 'hr') goalMins *= 60;
    const payload = { name: trimmed, emoji, color, freq, goalMins: Math.max(0, goalMins) };
    if (freq === 'Custom') payload.customDays = customDays;
    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{isEdit ? 'Edit habit' : 'New habit'}</h2>

        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning run" maxLength={40} autoFocus />

        <label>Icon</label>
        <div className="egrid">
          {EMOJIS.map(e => (
            <div key={e} className={'eopt' + (e === emoji ? ' sel' : '')} onClick={() => setEmoji(e)}>{e}</div>
          ))}
        </div>

        <label>Color</label>
        <div className="cgrid">
          {COLORS.map(c => (
            <div key={c} className={'copt' + (c === color ? ' sel' : '')} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>

        <label>Schedule</label>
        <div className="fpills">
          {FREQ_OPTIONS.map(f => (
            <button key={f.k} type="button" className={'fpill' + (f.k === freq ? ' sel' : '')} onClick={() => setFreq(f.k)}>{f.l}</button>
          ))}
        </div>

        {freq === 'Custom' && (
          <div style={{ marginTop: 8 }}>
            <label style={{ marginTop: 0 }}>Pick days</label>
            <div className="wdpills">
              {DAY_INITIALS.map((l, i) => (
                <button key={i} type="button" className={'wdpill' + (customDays.includes(i) ? ' sel' : '')} onClick={() => toggleCustomDay(i)}>{l}</button>
              ))}
            </div>
          </div>
        )}

        <div className="r2">
          <div>
            <label>Daily goal</label>
            <input type="number" min="0" max="480" placeholder="60" value={goalVal} onChange={e => setGoalVal(e.target.value)} />
          </div>
          <div>
            <label>Unit</label>
            <select value={goalUnit} onChange={e => setGoalUnit(e.target.value)}>
              <option value="min">minutes</option>
              <option value="hr">hours</option>
            </select>
          </div>
        </div>

        <div className="mbtns">
          <button className="bcnl" onClick={onClose}>Cancel</button>
          <button className="bsav" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
