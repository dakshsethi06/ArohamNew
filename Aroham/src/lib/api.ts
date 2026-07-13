import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";


export async function api(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
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
