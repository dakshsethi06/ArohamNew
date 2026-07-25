import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getEnv } from "../utils/env";

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDVVTIaMxp7wvFXpwEnKflPw2AqaqgrZWQ"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "aroham-ccfab.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "aroham-ccfab"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "aroham-ccfab.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "713205974438"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:713205974438:web:98503678415d7fb2f9bb67"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-RQBH4MTD6Q")
};

let app: any = null;
let firestoreDb: any = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  firestoreDb = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization warning (non-browser env):", e);
}

export const firebaseApp = app;
export const db = firestoreDb;

export const firebaseAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signOut: async () => {}
} as any;
