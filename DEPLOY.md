# Deploy Your Habit Tracker — Step by Step

This turns your habit tracker into a real website with **real Google Sign-In** and
data that syncs across all your devices. Total cost: **$0**.

Stack: **React + Vite** (the app) → **Firebase** (login + database) → **Vercel** (hosting)

Time needed: ~20-25 minutes, mostly clicking buttons.

---

## Part 1 — Create your Firebase project (~8 min)

1. Go to **https://console.firebase.google.com** and sign in with your Google account.
2. Click **"Add project"** → name it (e.g. `my-habit-tracker`) → click through the
   defaults (Google Analytics is optional, you can disable it) → **Create project**.
3. Once created, click the **Web icon (`</>`)** to add a web app.
   - Nickname: anything, e.g. `habit-tracker-web`
   - Don't check "Firebase Hosting" (we're using Vercel instead)
   - Click **Register app**
4. Firebase shows you a `firebaseConfig` object like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "my-habit-tracker.firebaseapp.com",
     projectId: "my-habit-tracker",
     storageBucket: "my-habit-tracker.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
   **Keep this tab open** — you'll copy these values into `.env` in Part 3.

5. **Enable Google Sign-In:**
   - Left sidebar → **Build → Authentication** → **Get started**
   - Click **Sign-in method** tab → click **Google** → toggle **Enable**
   - Set a support email (your email) → **Save**

6. **Create the database:**
   - Left sidebar → **Build → Firestore Database** → **Create database**
   - Choose **Production mode** → pick any location close to you → **Enable**
   - Go to the **Rules** tab → delete everything → paste the contents of
     `firestore.rules` (included in this project) → **Publish**
   - This makes sure each user can only ever read/write their *own* habit data.

---

## Part 2 — Get the code onto your computer (~3 min)

1. Download the project files (provided below) and unzip them into a folder.
2. Open a terminal in that folder.
3. Install Node.js if you don't have it: **https://nodejs.org** (LTS version).
4. Run:
   ```bash
   npm install
   ```

---

## Part 3 — Connect the code to Firebase (~2 min)

1. In the project folder, copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste in the values from your `firebaseConfig` (Part 1, step 4):
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=my-habit-tracker.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=my-habit-tracker
   VITE_FIREBASE_STORAGE_BUCKET=my-habit-tracker.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
3. Test it locally:
   ```bash
   npm run dev
   ```
   Open the URL it gives you (usually `http://localhost:5173`). You should see
   the login screen. Click **Continue with Google** — a real Google account
   picker popup should appear. (It will show a warning that the app isn't
   verified yet — that's normal and fine for personal use; click Advanced →
   Go to [app name].)

---

## Part 4 — Deploy to Vercel (~5 min)

1. Push your project to GitHub:
   - Create a new repo at **https://github.com/new**
   - In your project folder:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
     git push -u origin main
     ```
2. Go to **https://vercel.com** → sign up/log in with GitHub.
3. Click **Add New → Project** → select your `habit-tracker` repo → **Import**.
4. Before deploying, expand **Environment Variables** and add the same 6 values
   from your `.env` file (same names, same values).
5. Click **Deploy**. Wait ~1 minute.
6. You'll get a live URL like `https://habit-tracker-yourname.vercel.app` 🎉

---

## Part 5 — Authorize your live domain in Firebase (~1 min)

Google Sign-In only works on domains you've explicitly allowed.

1. Back in Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **Add domain** → paste your Vercel URL's domain
   (e.g. `habit-tracker-yourname.vercel.app`, no `https://`)
3. Save.

Now visit your live URL — Google Sign-In will work for real, with the actual
account picker, and your habits will sync to Firestore under your account.

---

## Updating the site later

Any time you want to change something:
```bash
git add .
git commit -m "description of change"
git push
```
Vercel automatically redeploys within ~1 minute of every push.

---

## Troubleshooting

- **"This app isn't verified" warning on Google login** — normal for personal
  projects. Click "Advanced" → "Go to [your app] (unsafe)". To remove this
  warning for real users, you'd submit the app for Google's OAuth verification
  (only needed if you're sharing this publicly with strangers).
- **Popup blocked** — allow popups for your site in the browser.
- **"Missing or insufficient permissions" in Firestore** — double check you
  published the rules from `firestore.rules` exactly.
- **Blank page after deploy** — check Vercel's environment variables match
  your `.env` exactly (same `VITE_` prefix on each).
