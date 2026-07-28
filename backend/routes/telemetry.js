const router = require("express").Router();

router.post("/click", async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }

  const GORSE_URL = process.env.GORSE_URL || "http://localhost:8088";

  try {
    const feedback = [{
      FeedbackType: "view_product",
      UserId: userId,
      ItemId: productId,
      Timestamp: new Date().toISOString()
    }];

    const response = await fetch(`${GORSE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback)
    });
    const txt = await response.text();

    res.json({ success: true, gorseResponse: txt });
  } catch (err) {
    console.error("[Telemetry] Gorse Error:", err.message);
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
