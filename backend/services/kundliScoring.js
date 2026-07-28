// backend/services/kundliScoring.js
// Derived Kundali feature extraction & soft-boost scoring logic

// Global in-memory cache for user Kundali derived profiles
global.kundaliProfiles = global.kundaliProfiles || {};

/**
 * Maps active Mahadasha and Moon Sign to recommended product categories & keywords.
 */
function getDerivedAstrologyProfile(mahadasha = "Saturn", moonSign = "Aries", nakshatra = "") {
  const dashaMap = {
    Saturn: {
      categories: ["Yantras", "Rudraksha", "Protection"],
      keywords: ["Shani", "Saturn", "8-Mukhi", "Neelam", "Protection", "Iron", "Shree Yantra"],
      guidance: "Saturn Mahadasha requires discipline, patience, and protective grounding remedies."
    },
    Rahu: {
      categories: ["Protection", "Yantras", "Rudraksha"],
      keywords: ["Rahu", "9-Mukhi", "Hessonite", "Gomed", "Protection", "Kavach"],
      guidance: "Rahu Mahadasha requires clarity, protection from illusions, and stabilizing Yantras."
    },
    Ketu: {
      categories: ["Rudraksha", "Protection", "Puja & Yantras"],
      keywords: ["Ketu", "Cat's Eye", "Lehsuniya", "9-Mukhi", "Moksha"],
      guidance: "Ketu Mahadasha favors spiritual inward reflection and protective Kavach remedies."
    },
    Jupiter: {
      categories: ["Gemstones", "Yantras", "Rudraksha"],
      keywords: ["Guru", "Jupiter", "Yellow Sapphire", "Pukhraj", "5-Mukhi", "Kanakdhara"],
      guidance: "Jupiter Mahadasha brings wisdom, expansion, and prosperity when supported by blessed Yantras."
    },
    Venus: {
      categories: ["Jewelry & Malas", "Gemstones", "Yantras"],
      keywords: ["Shukra", "Venus", "Diamond", "Opal", "Sphatik", "Lakshmi"],
      guidance: "Venus Mahadasha invites harmony, beauty, and abundance through energized Sphatik & Lakshmi remedies."
    },
    Mars: {
      categories: ["Yantras", "Protection", "Rudraksha"],
      keywords: ["Mangal", "Mars", "Red Coral", "Moonga", "3-Mukhi", "Hanuman"],
      guidance: "Mars Mahadasha calls for courage, vitality, and balancing intense cosmic energy."
    },
    Sun: {
      categories: ["Yantras", "Rudraksha", "Gemstones"],
      keywords: ["Surya", "Sun", "1-Mukhi", "Ruby", "Manik", "Aditya"],
      guidance: "Sun Mahadasha enhances leadership, vitality, and solar alignment through Surya remedies."
    },
    Moon: {
      categories: ["Jewelry & Malas", "Gemstones", "Rudraksha"],
      keywords: ["Chandra", "Moon", "Pearl", "Moti", "2-Mukhi", "Moonstone", "Silver"],
      guidance: "Moon Mahadasha enhances emotional peace, intuition, and mental tranquility."
    },
    Mercury: {
      categories: ["Gemstones", "Yantras", "Rudraksha"],
      keywords: ["Budh", "Mercury", "Emerald", "Panna", "4-Mukhi", "Ganesh"],
      guidance: "Mercury Mahadasha sharpens intellect, communication, and commercial success."
    }
  };

  const matched = dashaMap[mahadasha] || dashaMap.Saturn;
  return {
    moonSign,
    nakshatra,
    mahadasha,
    recommendedCategories: matched.categories,
    recommendedKeywords: matched.keywords,
    guidanceNote: matched.guidance
  };
}

/**
 * Applies soft-boosting (+0.20 weight) to candidate products based on derived Kundali profile.
 */
function scoreAndRankProducts(products = [], profile = null) {
  if (!products || products.length === 0) return [];
  if (!profile || !profile.recommendedCategories) return products;

  const scored = products.map((prod) => {
    let score = 1.0; // Base score

    // Hard filter check: stock availability
    if (prod.in_stock === false || prod.stock <= 0) {
      score = 0;
    }

    const catName = prod.category || prod.cat || "";
    const prodName = prod.name || "";
    const prodDesc = prod.short_desc || prod.desc || "";

    // Soft boost 1: Category match (+0.20)
    if (profile.recommendedCategories.some(c => catName.toLowerCase().includes(c.toLowerCase()))) {
      score += 0.20;
    }

    // Soft boost 2: Keyword match (+0.15)
    if (profile.recommendedKeywords.some(k => prodName.toLowerCase().includes(k.toLowerCase()) || prodDesc.toLowerCase().includes(k.toLowerCase()))) {
      score += 0.15;
    }

    let reasonBadge = "🔥 Popular Choice";
    if (score > 1.15) {
      reasonBadge = `✨ Aligned with ${profile.mahadasha} Dasha`;
    } else if (score > 1.0) {
      reasonBadge = `🔮 Recommended for ${profile.moonSign} Rashi`;
    }

    return { ...prod, astroScore: score, reasonBadge };
  });

  // Filter out out-of-stock items and sort by astroScore descending
  return scored
    .filter(p => p.astroScore > 0)
    .sort((a, b) => b.astroScore - a.astroScore);
}

module.exports = {
  getDerivedAstrologyProfile,
  scoreAndRankProducts
};
