// src/firebase.js
//
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (free)
// 3. Add a "Web App" inside the project -> it gives you a config object
// 4. Paste your config values into the object below
// 5. Enable "Google" sign-in method under Authentication -> Sign-in method
// 6. Create a Firestore database (production mode) under Build -> Firestore Database
//
// Full step-by-step instructions are in DEPLOY.md

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
