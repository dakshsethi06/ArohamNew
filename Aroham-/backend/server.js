// server.js — Aroham backend entry point
require("dotenv").config();
// Capture logs in memory for debugging
global.debugLogs = [];
const originalLog = console.log;
const originalError = console.error;

const safeStringify = (val) => {
  try {
    if (typeof val === "object" && val !== null) {
      return JSON.stringify(val);
    }
    return String(val);
  } catch (e) {
    return `[Unstringifiable: ${e.message}]`;
  }
};

console.log = (...args) => {
  global.debugLogs.push({ time: new Date().toISOString(), type: "log", msg: args.map(safeStringify).join(" ") });
  if (global.debugLogs.length > 200) global.debugLogs.shift();
  originalLog.apply(console, args);
};

console.error = (...args) => {
  global.debugLogs.push({ time: new Date().toISOString(), type: "error", msg: args.map(safeStringify).join(" ") });
  if (global.debugLogs.length > 200) global.debugLogs.shift();
  originalError.apply(console, args);
};

const app = express();

app.use(cors());

// Keep raw body for Razorpay webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); },
}));

// ---- Routes ----
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/auth", require("./routes/auth"));


app.get("/api/health", (req, res) => res.json({ status: "ok", service: "aroham-backend" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🕉️  Aroham backend running on http://localhost:${PORT}`));
