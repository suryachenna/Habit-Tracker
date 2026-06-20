// src/useHabitData.js
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_HABITS = () => {
  const t = new Date().toISOString().split('T')[0];
  return [
    { id: 1, name: 'Study session', emoji: '📚', color: '#378ADD', freq: 'Daily', goalMins: 120, completions: {}, created: t },
    { id: 2, name: 'Gym workout', emoji: '🏋️', color: '#ff6b6b', freq: 'Weekdays', goalMins: 60, completions: {}, created: t },
    { id: 3, name: 'Drink water', emoji: '💧', color: '#1D9E75', freq: 'Daily', goalMins: 0, completions: {}, created: t },
  ];
};

// Stores each user's data at: users/{uid}  in Firestore
// This is what makes data sync across devices once they're signed in.
export function useHabitData(uid) {
  const [habits, setHabits] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) { setReady(false); return; }
    let cancelled = false;
    (async () => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (cancelled) return;
      if (snap.exists()) {
        const data = snap.data();
        setHabits(data.habits || DEFAULT_HABITS());
        setSessions(data.sessions || []);
      } else {
        const initial = { habits: DEFAULT_HABITS(), sessions: [] };
        await setDoc(ref, initial);
        setHabits(initial.habits);
        setSessions(initial.sessions);
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const persist = useCallback(async (nextHabits, nextSessions) => {
    if (!uid) return;
    await setDoc(doc(db, 'users', uid), {
      habits: nextHabits,
      sessions: nextSessions,
      updatedAt: new Date().toISOString(),
    });
  }, [uid]);

  const saveHabits = useCallback((next) => {
    setHabits(next);
    persist(next, sessions);
  }, [persist, sessions]);

  const saveSessions = useCallback((next) => {
    setSessions(next);
    persist(habits, next);
  }, [persist, habits]);

  return { habits, sessions, ready, saveHabits, saveSessions, setHabits, setSessions, persist };
}
