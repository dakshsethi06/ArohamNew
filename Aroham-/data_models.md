# Aroham Data Models & Integration Requirements

To seamlessly integrate the new UI, the frontend components need to be mapped to the exact data shapes returned by the backend and expected by the database. Here is the remaining information required:

## 1. Data Models (Database Schema)

The new UI must expect and send data matching these structures. Note: **All prices/amounts are handled in Paise** on the backend (e.g., ₹499 is `49900`).

### `users` (Profile Data)
When saving/fetching profile details:
* `id` (UUID - maps to Supabase Auth user)
* `full_name` (Text)
* `phone` (Text)
* `email` (Text, optional)
* `gender` (Text)
* `dob` (Date - YYYY-MM-DD)
* `tob` (Time - HH:MM, optional)
* `pob_city`, `pob_state`, `pob_country` (Text, optional)
* `is_online` (Boolean, used for Astrologers)

### `products`
* `id` (BigInt)
* `name` (Text)
* `description` (Text)
* `price` (BigInt in Paise)
* `stock` (Int)
* `emoji` (Text - e.g., '📿')

### `orders` & `order_items`
When fetching order history:
* **Order**: `id` (UUID), `amount` (Paise), `status` (PENDING, CONFIRMED, PAYMENT_FAILED), `address` (JSON of the delivery address), `created_at`.
* **Items**: An array of items attached to the order containing `name`, `price`, `qty`, and `emoji`.

### `addresses`
When saving a delivery address during checkout:
* `name`, `phone`, `email`
* `address` (Street/House details)
* `city`, `pincode`

### `chat_sessions` & `chat_messages`
For the real-time chat interface:
* **Sessions**: `id`, `user_id`, `astrologer_id`, `status` (PENDING, ACCEPTED, DECLINED, COMPLETED).
* **Messages**: `id`, `session_id`, `sender_id`, `message` (Text - watch for the `REMEDY:Name|Emoji|Desc` special formatting).

## 2. Expected Frontend Routes / Views
The new UI should account for the following views/pages to match the current user flows:

1. **Home / Storefront** (`/`): Displays products and astrologer chat entry point.
2. **Authentication** (`/login`): Phone/Email login & signup.
3. **Cart & Checkout** (`/cart`): Cart management, address selection, and Razorpay payment trigger.
4. **Order Confirmation** (`/confirmation?orderId=...`): Post-payment success screen showing the invoice/details.
5. **User Profile** (`/profile`): Form for birth details and demographics.
6. **Order History** (`/orders`): List of past orders and statuses.
7. **Astrologer Dashboard** (`/astrologer`): Interface for experts to accept requests and chat (requires `role=astrologer`).

## 3. Local Storage Keys
If the new UI needs to maintain parity with the old UI's offline state, these keys were used:
* `aroham_cart`: Stores cart array for unauthenticated users.
* `aroham_buy_now_intent`: Stores a single item ID/Qty if a user clicks "Buy Now" before logging in.
* `supabase.auth.token`: (Managed by Supabase SDK)

## 4. UI Design Assets
* **Fonts Used**: `Fraunces` (for headings/serif) and `Outfit` (for body text).
* **Currency Formatting**: Ensure the UI divides price by `100` before formatting as INR (₹).
