import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Live Firebase configuration for Aroham (Corrected key with digit 0)
const getEnv = (key: string, fallback: string) => {
  const val = import.meta.env[key];
  if (!val || typeof val !== "string") return fallback.trim();
  return val.replace(/["']/g, "").trim();
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDm11Yrv-OKg68atLeq_ir30vm1Ozat4zs"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "aroham-8397b.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "aroham-8397b"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "aroham-8397b.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "836817413216"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:836817413216:web:17668c6b8350d537248f05"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-W6YVDPCK9Y")
};

// Initialize Firebase App singleton with local persistent login state
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);

// Enforce permanent local browser persistence until user explicitly clicks Logout
setPersistence(firebaseAuth, browserLocalPersistence).catch(err => {
  console.error("Firebase persistence error:", err);
});
