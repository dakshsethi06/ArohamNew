import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Live Firebase configuration for Aroham (Project: aroham-ccfab)
const getEnv = (key: string, fallback: string) => {
  const val = import.meta.env[key];
  if (!val || typeof val !== "string") return fallback.trim();
  return val.replace(/["']/g, "").trim();
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDVVTIaMxp7wvFXpwEnKflPw2AqaqgrZWQ"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "aroham-ccfab.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "aroham-ccfab"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "aroham-ccfab.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "713205974438"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:713205974438:web:98503678415d7fb2f9bb67"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-RQBH4MTD6Q")
};

// Initialize Firebase App singleton with IndexedDB persistence (avoids Chrome credential management prompt)
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Use IndexedDB persistence - does NOT trigger Chrome's "Access other apps" permission dialog
setPersistence(firebaseAuth, indexedDBLocalPersistence).catch(err => {
  console.error("Firebase persistence error:", err);
});
