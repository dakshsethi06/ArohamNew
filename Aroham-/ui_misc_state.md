# Aroham UI: Miscellaneous State & Asset Guidelines

After cross-referencing all connection points and data models, here is the final set of remaining information required to ensure complete parity with the old UI.

## 1. Local Storage State Management
Beyond the standard Supabase auth token, the frontend relies on `localStorage` for several transient states:
* `aroham_cart`: A JSON stringified array of cart items (used when a user browses without logging in).
* `aroham_buy_now_intent`: Stores `{ productId, qty }` when an unauthenticated user clicks "Buy Now", allowing the flow to seamlessly resume and skip the cart after they log in.
* `notes_{sessionId}`: Used on the Astrologer Dashboard to save scratchpad notes for a specific consultation session so they survive a page reload.

## 2. Asset & Media Guidelines (No Images!)
The current Aroham UI is highly optimized and actually **does not use external product images**. 
* **Products**: Visuals are driven entirely by the `emoji` column in the database (e.g., `📿` for Rudraksha, `🔱` for Yantra). Ensure your new UI components are designed to display a prominent Emoji placeholder instead of an `<img>` tag for products.
* **Astrologer Avatars**: Profile pictures for astrologers are generated dynamically using the first letter of their `full_name` (e.g., `full_name.charAt(0).toUpperCase()`).
* **Hero Image**: The only static image asset is `aroham_hero_bg.png` used on the homepage hero section.

## 3. UI/UX Notification Patterns
* **Toasts**: All error handling and success messages (e.g., "Consultation ended", "Added to cart", "Insufficient stock") are displayed using a unified Toast notification system. The new UI should implement a robust Toast/Snackbar provider at the root level to handle these backend responses.

## 4. Pending Auth Flow Actions
When a user logs in, the `auth.js` script checks for pending actions:
* If `aroham_buy_now_intent` exists, it immediately redirects them to `/cart.html?buyNow=true` and attempts to process the quick-buy.
* If `aroham_cart` exists and is populated, it pushes the local cart to the backend via `POST /api/cart` to sync their offline items with their authenticated account.
Your new UI auth state listener will need to replicate this post-login synchronization logic.
