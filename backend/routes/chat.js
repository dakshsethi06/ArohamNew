const router = require("express").Router();
const supabase = require("../config/supabase");

// Helper to format google drive images (same as products.js)
function formatImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

router.post("/", async (req, res) => {
  const { message, userId = "user_demo_123" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const GORSE_URL = process.env.GORSE_URL || "http://localhost:8088";
  let recommendedProducts = [];

  try {
    // 1. Fetch recommendations from Gorse
    const gorseRes = await fetch(`${GORSE_URL}/api/recommend/${userId}?n=3`);
    if (gorseRes.ok) {
      const itemIds = await gorseRes.json();
      if (itemIds && itemIds.length > 0) {
        // 2. Query Supabase for product details
        const { data: dbProducts } = await supabase
          .from("products")
          .select("*")
          .in("id", itemIds);

        if (dbProducts) {
          recommendedProducts = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            desc: p.short_desc || p.subtitle || "Vedic remedial tool",
            price: `₹${(p.price / 100).toFixed(2)}`
          }));
        }
      }
    }
  } catch (err) {
    console.error("[Chat API Gorse Error]:", err.message);
  }

  // 3. Inject system prompt instructions
  let systemPrompt = `You are AstroShop's AI Astrological Advisor.
You speak empathetically, using conversational, non-deterministic astrological guidance (never claim 100% guarantees).`;

  if (recommendedProducts.length > 0) {
    const productText = recommendedProducts.map(p => `- Name: ${p.name}, Price: ${p.price}, Description: ${p.desc}`).join("\n");
    systemPrompt += `\n\nThe Machine Learning engine recommends these products:\n${productText}\n\nYou MUST naturally weave a recommendation for 1 or 2 of these items into your response. Dedicate a section titled "💎 Recommended For You" at the bottom of your message, format the product name in bold, explain why it suits them, and state '(Available in the Store)'.`;
  }

  // 4. Call Groq using native fetch
  try {
    const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    if (!groqRes.ok) {
      throw new Error(`Groq API returned status ${groqRes.status}`);
    }

    const data = await groqRes.json();
    const reply = data.choices[0]?.message?.content || "I'm having trouble connecting to the cosmos right now.";

    res.json({
      reply,
      recommendations_injected: recommendedProducts.length > 0
    });
  } catch (err) {
    console.error("[Chat API Groq Error]:", err.message);
    res.status(500).json({ error: "Failed to generate chatbot response", details: err.message });
  }
});

module.exports = router;
