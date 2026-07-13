// routes/products.js — public product listing (DB READ: PRODUCT & INVENTORY)
const router = require("express").Router();
const supabase = require("../config/supabase");

// GET /api/products
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error) return res.status(500).json({ error: error.message });

  // Map to the frontend ArohamProduct format
  const mapped = data.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    purpose: p.purpose,
    price: p.price / 100,
    original: p.original_price / 100,
    rating: p.rating,
    reviews: p.reviews,
    img: p.img,
    badges: p.badges || [],
    shortDesc: p.short_desc,
    benefits: p.benefits || [],
    size: p.size,
    material: p.material,
    useFor: p.use_for || [],
    stock: p.stock
  }));
  res.json(mapped);
});

module.exports = router;
