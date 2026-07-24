// config/razorpay.js — Razorpay instance (test mode keys from .env)
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
});

module.exports = razorpay;
