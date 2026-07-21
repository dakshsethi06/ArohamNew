require('dotenv').config();
const ShiprocketService = require('./services/shiprocket/ShiprocketService');

async function run() {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    console.log("Testing Shiprocket Serviceability for email:", email);
    
    const service = new ShiprocketService(email, password);
    const result = await service.checkServiceability("110001", "400001", 0.5, 1);
    console.log("SERVICEABILITY RESULT:", JSON.stringify(result, null, 2).slice(0, 500));
  } catch (e) {
    console.error("SERVICEABILITY TEST FAILED:", e.message);
  }
}
run();
