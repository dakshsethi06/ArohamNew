require("dotenv").config();
const { confirmOrder } = require("./services/paymentService");

async function run() {
  const orderId = "9d9f124e-0c0c-4f7a-820d-dcadb8900ed6";
  console.log("Pinging Shiprocket for Order ID:", orderId);
  try {
    await confirmOrder(orderId, { razorpay_payment_id: "pay_TCy5CLE3hcb0ZN" });
    console.log("Shiprocket execution complete.");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
