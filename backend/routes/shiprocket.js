const router = require("express").Router();
const ShiprocketService = require("../services/shiprocket/ShiprocketService");

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const shiprocket = new ShiprocketService(email, password);

// GET /api/shiprocket/serviceability?delivery_pincode=XXXXXX
router.get("/serviceability", async (req, res) => {
  try {
    const { delivery_pincode } = req.query;
    if (!delivery_pincode || delivery_pincode.length !== 6) {
      return res.status(400).json({ error: "Invalid delivery pincode" });
    }

    const pickup_pincode = "110001"; // Default warehouse pickup location
    const data = await shiprocket.checkServiceability(pickup_pincode, delivery_pincode);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
