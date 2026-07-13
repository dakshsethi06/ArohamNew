const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const supabase = require("../config/supabase");

// GET /api/addresses/debug-schema - Query columns to debug missing id
router.get("/debug-schema", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .limit(1);

    if (error) {
      return res.json({ error: error.message });
    }

    res.json({
      success: true,
      empty: data.length === 0,
      columns: data.length > 0 ? Object.keys(data[0]) : "unknown (table is empty)"
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// GET /api/addresses - Fetch saved addresses for the user
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/addresses - Save a shipping address
router.post("/", requireAuth, async (req, res) => {
  const { name, phone, email, address, city, pincode } = req.body;
  if (!phone || !/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
  }
  try {
    // Check if the exact address already exists to avoid duplication
    const { data: existing, error: findErr } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("name", name)
      .eq("phone", phone)
      .eq("address", address)
      .eq("city", city)
      .eq("pincode", pincode)
      .maybeSingle();

    if (findErr) throw findErr;
    if (existing) {
      return res.json({ success: true, message: "Address already saved", data: existing });
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({ user_id: req.user.id, name, phone, email, address, city, pincode })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
