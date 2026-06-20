# Habit Tracker

A habit tracker with real Google Sign-In, a Pomodoro focus timer, Focus Lock
mode, custom day scheduling, and progress charts — built with React + Vite,
Firebase Auth/Firestore, deployable for free on Vercel.

## Quick start

See **DEPLOY.md** for the full step-by-step setup and deployment guide
(Firebase project, Google Sign-In, Firestore, Vercel hosting).

```bash
npm install
cp .env.example .env   # then fill in your Firebase config
npm run dev
```

## Features

- Real "Continue with Google" sign-in (Firebase Authentication)
- Per-user data synced across devices (Firestore)
- Daily habit view with date navigation + jump-to-date calendar
- Custom scheduling: every day, weekdays, weekends, or pick specific days
- Per-habit daily time goals (minutes/hours) with progress bars
- Pomodoro timer with configurable focus/break durations, linked to a habit
- Focus Lock mode: full-screen warning if you switch tabs/apps mid-session
- Reports tab: weekly completion chart, 14-day focus chart, per-habit streak
  chart, and full daily history since you started
- Clean dark UI, mobile + tablet responsive

## Project structure

```
src/
  App.jsx              main app shell, tab routing, focus lock logic
  App.css              all styles
  firebase.js          Firebase init (reads from .env)
  useAuth.js           Google sign-in/out hook
  useHabitData.js      Firestore read/write hook for habits + sessions
  components/
    LoginScreen.jsx
    HabitsTab.jsx
    PomodoroTab.jsx
    ReportsTab.jsx
    HabitModal.jsx
    FocusLockBar.jsx
  utils/date.js         date/streak/formatting helpers
firestore.rules          Firestore security rules (per-user access only)
```
