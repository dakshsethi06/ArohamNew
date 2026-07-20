const PROMO_CODES = [
  { code: "AROHAM10", type: "percentage", value: 10, title: "10% Off All Sacred Items", description: "Get a 10% discount on any yantra, rudraksha, or healing crystal in your order. No minimum purchase.", expiry: "31 Dec 2026", tag: "Storewide" },
  { code: "DEVOTION20", type: "percentage", value: 20, minPurchase: 300000, title: "20% Off Orders Above ₹3,000", description: "Receive 20% discount on premium orders. Perfect for Navagraha Complete Kits and custom idols.", expiry: "31 Dec 2026", tag: "High Value" },
  { code: "FESTIVE500", type: "flat", value: 50000, minPurchase: 250000, title: "Flat ₹500 Off Above ₹2,500", description: "Get a flat savings of ₹500 when your cart subtotal exceeds ₹2,500. Limited time festive offer.", expiry: "31 Dec 2026", tag: "Festive Special" },
  { code: "FREEENERGIZATION", type: "flat", value: 9900, title: "Free Temple Consecration (Save ₹99)", description: "Get free temple energization rituals for your items. Offsets the standard ₹99 consecration fee.", expiry: "31 Dec 2026", tag: "Blessing" },
  { code: "FIRST300", type: "flat", value: 30000, title: "Flat ₹300 Off First Order", description: "Welcome to Aroham! Take a flat ₹300 off on your first sacred purchase.", expiry: "31 Dec 2026", tag: "Welcome Offer" }
];

async function fetchCartItemsForOffers() {
  try {
    const { data } = await db.auth.getSession();
    if (data.session) {
      return api("/cart?temp=false");
    }
  } catch (e) {
    console.error("Failed session fetch in offers", e);
  }
  return getCart();
}

window.copyPromoCode = function(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.textContent;
    btn.textContent = "Copied! ✓";
    btn.style.color = "#2E7D32";
    showToast(`Code "${code}" copied to clipboard! 📋`);
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = "";
    }, 2000);
  }).catch(err => {
    showToast("Failed to copy code: " + err);
  });
};

window.applyPromoFromPage = function(code) {
  const promo = PROMO_CODES.find(p => p.code === code);
  if (!promo) return;
  
  fetchCartItemsForOffers().then(cart => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    
    if (cart.length === 0) {
      return showToast("Your cart is empty! Add sacred items before applying this offer.");
    }
    
    if (promo.minPurchase && subtotal < promo.minPurchase) {
      return showToast(`This offer requires a minimum purchase of ${formatINR(promo.minPurchase)} (Your current subtotal is ${formatINR(subtotal)})`);
    }
    
    localStorage.setItem("applied_promo", promo.code);
    showToast(`Promo code ${promo.code} applied successfully! 🎉`);
    if (typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    setTimeout(() => {
      window.location.href = "cart.html";
    }, 1200);
  }).catch(err => {
    showToast("Error validation: " + err.message);
  });
};

window.filterOffers = function(type) {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }
  renderOffersList(type);
};

function renderOffersList(filterType = "all") {
  const grid = document.getElementById("offers-grid");
  if (!grid) return;
  
  let filtered = PROMO_CODES;
  if (filterType === "percentage") {
    filtered = PROMO_CODES.filter(p => p.type === "percentage");
  } else if (filterType === "flat") {
    filtered = PROMO_CODES.filter(p => p.type === "flat");
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; padding: 40px 0; text-align: center; color: var(--muted);">No offers available for this category.</p>`;
    return;
  }
  
  grid.innerHTML = filtered.map(p => {
    const minText = p.minPurchase ? `Min. Purchase: ${formatINR(p.minPurchase)}` : "No Minimum Purchase";
    const discountText = p.type === "percentage" ? `${p.value}%` : `${formatINR(p.value)}`;
    const discountSuffix = p.type === "percentage" ? "OFF" : "OFF";
    
    return `
      <div class="offer-card">
        <div class="offer-top">
          <span class="offer-tag">${p.tag}</span>
          <div class="offer-val">${discountText} <span>${discountSuffix}</span></div>
          <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 4px;">Valid until: ${p.expiry}</div>
        </div>
        <div class="offer-bottom">
          <h3 class="offer-title">${p.title}</h3>
          <p class="offer-desc">${p.description}</p>
          <div style="font-size: 0.78rem; font-weight: 600; color: var(--maroon); margin-bottom: 14px;">
            📌 ${minText}
          </div>
          <div class="coupon-code-wrap">
            <span class="coupon-code">${p.code}</span>
            <button class="btn-copy" onclick="copyPromoCode('${p.code}', this)">Copy Code</button>
          </div>
          <div class="offer-actions">
            <button class="btn btn-primary" style="padding: 10px 18px; font-size: 0.85rem; border-radius: 8px; font-weight: 600;" onclick="applyPromoFromPage('${p.code}')">Apply Offer</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.toggleFaq = function(header) {
  const item = header.parentElement;
  const answer = item.querySelector(".faq-a");
  const arrow = header.querySelector("span");
  
  const isHidden = answer.classList.contains("hidden");
  
  if (isHidden) {
    answer.classList.remove("hidden");
    arrow.textContent = "▲";
  } else {
    answer.classList.add("hidden");
    arrow.textContent = "▼";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderOffersList("all");
});
