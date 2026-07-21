// middleware/auth.js — verifies Firebase / Supabase access tokens sent by frontend
const supabase = require("../config/supabase");
let admin = null;
try {
  admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (e) {
  // Firebase Admin fallback if service account key is unconfigured
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  // 1. Try Firebase Admin token verification
  if (admin && admin.apps.length) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        user_metadata: {
          full_name: decodedToken.name || "",
          phone: decodedToken.phone_number || ""
        }
      };
      return next();
    } catch (e) {
      // Token is not a valid Firebase token, fallback to Supabase
    }
  }

  // 2. Fallback to Supabase token verification
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = data.user; // { id, email, ... }
  next();
}

module.exports = requireAuth;
