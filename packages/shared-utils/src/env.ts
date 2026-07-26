// Cross-platform environment variable accessor (Vite Web & React Native / Metro / Node)

export function getEnv(key: string, fallback: string = ""): string {
  try {
    const g = typeof globalThis !== "undefined" ? (globalThis as any) : (typeof window !== "undefined" ? (window as any) : {});
    if (g.process && g.process.env && g.process.env[key]) {
      return String(g.process.env[key]).replace(/["']/g, "").trim();
    }
  } catch (e) {}

  try {
    const metaEnv = new Function("try { return import.meta.env; } catch(e) { return undefined; }")();
    if (metaEnv && metaEnv[key]) {
      return String(metaEnv[key]).replace(/["']/g, "").trim();
    }
  } catch (e) {}

  return fallback;
}
