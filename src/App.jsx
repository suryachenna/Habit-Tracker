// src/App.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useHabitData } from './useHabitData';
import LoginScreen from './components/LoginScreen';
import HabitsTab from './components/HabitsTab';
import PomodoroTab from './components/PomodoroTab';
import ReportsTab from './components/ReportsTab';
import FocusLockBar from './components/FocusLockBar';
import HabitModal from './components/HabitModal';
import { todayStr } from './utils/date';
import './App.css';

export default function App() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { habits, sessions, ready, saveHabits, saveSessions } = useHabitData(user?.uid);

  const [tab, setTab] = useState('habits');
  const [curDate, setCurDate] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Focus Lock state
  const [focusLock, setFocusLock] = useState(false);
  const [distractCount, setDistractCount] = useState(0);
  const [showDistraction, setShowDistraction] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    function onVis() { if (focusLock && document.hidden) trigger(); }
    function onBlur() { if (focusLock) trigger(); }
    function trigger() { setDistractCount(c => c + 1); setShowDistraction(true); }
    function onBeforeUnload(e) { if (focusLock) { e.preventDefault(); e.returnValue = ''; } }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [focusLock]);

  const toggleFocusLock = async () => {
    const next = !focusLock;
    setFocusLock(next);
    if (next) {
      setDistractCount(0);
      try { if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch {}
    } else {
      try { wakeLockRef.current?.release(); } catch {}
      wakeLockRef.current = null;
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="bg">
        <div className="wrap">
          <LoginScreen onGoogleLogin={loginWithGoogle} />
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="bg"><div className="loading-screen">Loading your habits…</div></div>;
  }

  return (
    <div className="bg">
      <div className="wrap">
        <header className="header">
          <h1>🔥 Habit Tracker</h1>
          <div className="header-right">
            <div className="tabs">
              <button className={tab==='habits'?'tab active':'tab'} onClick={()=>setTab('habits')}>Habits</button>
              <button className={tab==='pomo'?'tab active':'tab'} onClick={()=>setTab('pomo')}>Timer</button>
              <button className={tab==='report'?'tab active':'tab'} onClick={()=>setTab('report')}>Reports</button>
            </div>
            <div className="profile-wrap">
              <button className="profile-chip" onClick={()=>setProfileMenuOpen(o=>!o)}>
                {user.photoURL
                  ? <img className="profile-avatar-img" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                  : <div className="profile-avatar">{(user.displayName||user.email||'?')[0].toUpperCase()}</div>}
                <span className="profile-name">{user.displayName || user.email}</span>
              </button>
              {profileMenuOpen && (
                <div className="pmenu">
                  <div className="pmenu-email">{user.email}</div>
                  <div className="pmenu-div" />
                  <div className="pmenu-item" onClick={()=>{ setProfileMenuOpen(false); logout(); }}>🚪 Sign out</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <FocusLockBar enabled={focusLock} onToggle={toggleFocusLock} />

        {tab === 'habits' && (
          <HabitsTab
            habits={habits}
            sessions={sessions}
            saveHabits={saveHabits}
            curDate={curDate}
            setCurDate={setCurDate}
            onAddHabit={() => { setEditingHabit(null); setModalOpen(true); }}
            onEditHabit={(h) => { setEditingHabit(h); setModalOpen(true); }}
            onStartPomo={(habitId) => setTab('pomo')}
          />
        )}
        {tab === 'pomo' && (
          <PomodoroTab habits={habits} sessions={sessions} saveSessions={saveSessions} />
        )}
        {tab === 'report' && (
          <ReportsTab habits={habits} sessions={sessions} onOpenDay={(d)=>{ setCurDate(d); setTab('habits'); }} />
        )}

        {modalOpen && (
          <HabitModal
            habit={editingHabit}
            onClose={() => setModalOpen(false)}
            onSave={(h) => {
              if (editingHabit) {
                saveHabits(habits.map(x => x.id === editingHabit.id ? { ...x, ...h } : x));
              } else {
                saveHabits([...habits, { id: Date.now(), completions: {}, created: todayStr(), ...h }]);
              }
              setModalOpen(false);
            }}
          />
        )}

        {showDistraction && (
          <div className="doverlay show">
            <div style={{fontSize:44}}>🛑</div>
            <h2>Focus Mode is ON!</h2>
            <p>You're in a focus session. Come back and finish what you started.</p>
            {distractCount > 1 && <div className="dcnt">You've tried to leave {distractCount} times.</div>}
            <button className="dback" onClick={()=>setShowDistraction(false)}>Back to Focus</button>
            <button className="dexit" onClick={()=>{ setFocusLock(false); setShowDistraction(false); }}>Exit focus mode anyway</button>
          </div>
        )}

        <footer className="footer"><span>Made by <b>Vatshaa</b></span></footer>
      </div>
    </div>
  );
}
