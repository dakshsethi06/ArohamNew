// routes/orders.js — "2/3. ORDER CREATION & PROCESSING" + order history
const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const razorpay = require("../config/razorpay");
const { validateItems } = require("../services/validationService");
const { createPendingOrder, getUserOrders } = require("../services/orderService");
const supabase = require("../config/supabase");

// GET /api/orders/debug-last - Debug latest order details
router.get("/debug-last", async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.json({ error: error.message });
    }

    res.json({
      success: true,
      order: orders[0] || null
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// GET /api/orders/debug-logs - Fetch the in-memory debug logs
router.get("/debug-logs", (req, res) => {
  res.json({
    success: true,
    logs: global.debugLogs || []
  });
});

// POST /api/orders  body: { items: [{id, qty}], address: {...}, checkoutType }
// Validates → creates PENDING order + items + reserves stock + payment record
// → creates Razorpay order → returns checkout details to frontend
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, address, checkoutType } = req.body;
    const check = await validateItems(items);
    if (!check.valid) return res.status(400).json({ errors: check.errors });

    const { order, amount } = await createPendingOrder(req.user.id, check.products, address);


    // Initiate Payment: create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount, currency: "INR", receipt: String(order.id),
      notes: { order_id: String(order.id) },
    });
    await supabase.from("payments")
      .update({ razorpay_order_id: rzpOrder.id }).eq("order_id", order.id);

    res.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount, currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/orders — order history (orders + items + payment status)
router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await getUserOrders(req.user.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
