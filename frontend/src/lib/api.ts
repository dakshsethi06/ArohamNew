import { supabase } from "./supabase";
import { firebaseAuth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function api(endpoint: string, options: RequestInit = {}) {
  // Get token from Firebase Auth first, fallback to Supabase
  let token: string | null = null;
  if (firebaseAuth.currentUser) {
    try {
      token = await firebaseAuth.currentUser.getIdToken();
    } catch (e) {
      console.error("Firebase token fetch error:", e);
    }
  }

  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
  }
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorMsg = body.error || (body.errors || []).join(", ") || response.statusText;
    throw new Error(errorMsg);
  }
  
  return body;
}
