require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const xlsx = require("xlsx");
const fs = require("fs");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Delete dependent rows
  console.log("Cleaning up old data...");
  await supabase.from("cart_items").delete().neq("id", 0);
  await supabase.from("order_items").delete().neq("id", 0);
  await supabase.from("products").delete().neq("id", 0);

  // 2. Parse Excel
  const wb = xlsx.readFile("../../astrotalk_20_products.xlsx");
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const richProducts = [];

  // Bagla Mukhi Yantra
  richProducts.push({
    name: "Bagla Mukhi Yantra",
    slug: "bagla-mukhi-yantra",
    subtitle: "24K Gold Plated",
    category: "Yantra",
    purpose: "Protection",
    price: 59900,
    original_price: 89900,
    rating: 4.8,
    reviews: 312,
    img: "https://washi-custom-22412387.figma.site/_components/v2/0efc643709f6f883f69747b3c071474ddf94fb96/WhatsApp_Image_2026-07-04_at_20.51.30.b3cad81a.jpeg",
    badges: ["Temple Energized", "Bestseller"],
    shortDesc: "Stambhan · Vijay · Raksha. Controls negativity, brings victory in legal matters and protects from enemies.",
    benefits: ["Victory in Legal Matters", "Protection From Enemies", "Increases Confidence", "Improves Communication", "Brings Peace & Mental Stability"],
    size: "3.5 cm x 3.5 cm (Approx.)",
    material: "Metal (Golden Finish)",
    useFor: ["Pendant", "Pocket", "Wallet", "Car", "Pooja Sthal", "Safe/Locker"],
    description: "Shri Bagla Mukhi Yantra. Stambhan Shakti. Vijay & Protection. Enhances Will Power. Brings Control Over Negativity & Enemies. Divine Golden Finish. Perfect for Daily Carry.",
    stock: 100,
    emoji: "🕉️"
  });

  rows.forEach((row, i) => {
    const name = row["Product Name"] || "Unknown Product " + i;
    const priceInr = parseFloat(row["Price in INR"] || "999");
    const desc = row["Product Description"] || "";
    const img = row["Photo URL"] || "https://via.placeholder.com/400x400?text=" + encodeURIComponent(name);

    richProducts.push({
      name: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      subtitle: "Authentic & Energized",
      category: name.toLowerCase().includes("rudraksha") ? "Rudraksha" : (name.toLowerCase().includes("gem") || name.toLowerCase().includes("stone") ? "Gemstone" : "Puja Items"),
      purpose: "Well-being",
      price: Math.round(priceInr * 100),
      original_price: Math.round(priceInr * 100 * 1.2),
      rating: +(4.5 + Math.random() * 0.5).toFixed(1),
      reviews: Math.floor(Math.random() * 500) + 50,
      img: img,
      badges: ["Authentic", "Energized"],
      shortDesc: desc.substring(0, 100) + "...",
      benefits: ["Brings Positivity", "Enhances Well-being", "Spiritual Growth"],
      size: "Standard",
      material: "Natural",
      useFor: ["Personal Wear", "Puja"],
      description: desc,
      stock: 50,
      emoji: "🌟"
    });
  });

  // 3. Insert into Supabase
  const { data: inserted, error } = await supabase.from("products").insert(
    richProducts.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      emoji: p.emoji
    }))
  ).select();

  if (error) {
    console.error("Error inserting products:", error);
    return;
  }

  // 4. Save metadata matching IDs
  const metaMap = {};
  for (let i = 0; i < inserted.length; i++) {
    const dbProduct = inserted[i];
    const rich = richProducts[i];
    metaMap[dbProduct.id] = {
      slug: rich.slug,
      subtitle: rich.subtitle,
      category: rich.category,
      purpose: rich.purpose,
      original_price: rich.original_price,
      rating: rich.rating,
      reviews: rich.reviews,
      img: rich.img,
      badges: rich.badges,
      shortDesc: rich.shortDesc,
      benefits: rich.benefits,
      size: rich.size,
      material: rich.material,
      useFor: rich.useFor
    };
  }

  fs.writeFileSync("products_meta.json", JSON.stringify(metaMap, null, 2));
  console.log("Successfully seeded products and created products_meta.json!");
}

run();
