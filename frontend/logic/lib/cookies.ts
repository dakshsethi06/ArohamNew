// src/lib/cookies.ts — Standardized Cookie utility functions

export function setCookie(name: string, value: string, days: number = 365): void {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secure}`;
  } catch (e) {
    console.warn("Cookie set warning:", e);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (e) {
    console.warn("Cookie get warning:", e);
  }
  return null;
}

export function deleteCookie(name: string): void {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
  } catch (e) {
    console.warn("Cookie delete warning:", e);
  }
}
