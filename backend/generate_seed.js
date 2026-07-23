const xlsx = require("xlsx");
const fs = require("fs");

const wb = xlsx.readFile("../../astrotalk_20_products.xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

let sql = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price bigint;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews int;
ALTER TABLE products ADD COLUMN IF NOT EXISTS img text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badges jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_desc text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_for jsonb;

DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM products;

`;

function sanitize(str) {
  if (!str) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

const products = [];

// 1. Bagla Mukhi Yantra (from image)
products.push({
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
  short_desc: "Stambhan · Vijay · Raksha. Controls negativity, brings victory in legal matters and protects from enemies.",
  benefits: ["Victory in Legal Matters", "Protection From Enemies", "Increases Confidence", "Improves Communication", "Brings Peace & Mental Stability"],
  size: "3.5 cm x 3.5 cm (Approx.)",
  material: "Metal (Golden Finish)",
  use_for: ["Pendant", "Pocket", "Wallet", "Car", "Pooja Sthal", "Safe/Locker"],
  description: "Shri Bagla Mukhi Yantra. Stambhan Shakti. Vijay & Protection. Enhances Will Power. Brings Control Over Negativity & Enemies. Divine Golden Finish. Perfect for Daily Carry.",
  stock: 100
});

// 2. Excel Products
rows.forEach((row, i) => {
  const name = row["Product Name"] || "Unknown Product " + i;
  const priceInr = parseFloat(row["Price in INR"] || "999");
  const desc = row["Product Description"] || "";
  const img = row["Photo URL"] || "https://via.placeholder.com/400x400?text=" + encodeURIComponent(name);

  // default mock values for other fields
  products.push({
    name: name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    subtitle: "Authentic & Energized",
    category: name.toLowerCase().includes("rudraksha") ? "Rudraksha" : (name.toLowerCase().includes("gem") || name.toLowerCase().includes("stone") ? "Gemstone" : "Puja Items"),
    purpose: "Well-being",
    price: Math.round(priceInr * 100),
    original_price: Math.round(priceInr * 100 * 1.2), // fake 20% markup
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 500) + 50,
    img: img,
    badges: ["Authentic", "Energized"],
    short_desc: desc.substring(0, 100) + "...",
    benefits: ["Brings Positivity", "Enhances Well-being", "Spiritual Growth"],
    size: "Standard",
    material: "Natural",
    use_for: ["Personal Wear", "Puja"],
    description: desc,
    stock: 50
  });
});

products.forEach(p => {
  sql += `INSERT INTO products (name, slug, subtitle, category, purpose, price, original_price, rating, reviews, img, badges, short_desc, benefits, size, material, use_for, description, stock) VALUES (
    ${sanitize(p.name)},
    ${sanitize(p.slug)},
    ${sanitize(p.subtitle)},
    ${sanitize(p.category)},
    ${sanitize(p.purpose)},
    ${p.price},
    ${p.original_price},
    ${p.rating.toFixed(1)},
    ${p.reviews},
    ${sanitize(p.img)},
    '${JSON.stringify(p.badges).replace(/'/g, "''")}',
    ${sanitize(p.short_desc)},
    '${JSON.stringify(p.benefits).replace(/'/g, "''")}',
    ${sanitize(p.size)},
    ${sanitize(p.material)},
    '${JSON.stringify(p.use_for).replace(/'/g, "''")}',
    ${sanitize(p.description)},
    ${p.stock}
  );\n`;
});

fs.writeFileSync("seed.sql", sql);
console.log("seed.sql generated successfully!");
