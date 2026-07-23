/**
 * Safe UUID Generator compatible across all browser contexts (HTTPS, HTTP, Vercel Previews, Mobile Browsers)
 */
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return "aroham-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
};
