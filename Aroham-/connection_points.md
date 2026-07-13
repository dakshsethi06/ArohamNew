# Aroham Connection Points & UI Integration Guide

This document records all the necessary endpoints, connection points, and triggers happening within the current UI. This serves as a blueprint for replacing the UI.

## 1. Network & System Connections

### Environment Configuration
* **Supabase URL**: `https://lzzdfsphevmzbkkoskxb.supabase.co`
* **Supabase Anon Key**: `sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ`
* **Backend API Base**: `http://localhost:5001/api` (Ensure backend is running on the corresponding port).

### Authentication Delivery
* All requests to `http://localhost:5001/api` must include the Supabase JWT:
  `Authorization: Bearer <session.access_token>`

## 2. API Endpoints

The frontend connects to these specific backend endpoints:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/email-by-phone?phone={num}` | `GET` | Look up a user's email via their phone number for Supabase login. |
| `/api/auth/profile` | `GET / POST` | Fetch or update user demographics (birth details, gender, address). |
| `/api/products` | `GET` | Fetch the list of products for the storefront. |
| `/api/cart` (or `?temp=true`) | `GET / POST` | Fetch the cart, or add an item (`{ productId, qty }`). |
| `/api/cart/{id}` | `PUT / DELETE` | Update quantity or remove an item. |
| `/api/cart/buy-now` | `POST` | Quick checkout for a single item (skips main cart). |
| `/api/addresses` | `GET / POST` | Fetch saved addresses or save a new one. |
| `/api/orders` | `GET / POST` | Fetch user orders, or create a new Razorpay order. |
| `/api/payments/verify` | `POST` | Verify Razorpay successful payment signature. |
| `/api/payments/failed` | `POST` | Report a failed/dismissed Razorpay checkout. |
| `/api/astrologers/list` | `GET` | Fetch registered astrologers. |
| `/api/admin/check` | `GET` | Verify if the logged-in user is an admin. |

## 3. Real-Time WebSockets (Supabase Channels)

The chat and dashboard features use Supabase Realtime subscriptions:

| Channel Name | Table/Filter | Purpose |
| :--- | :--- | :--- |
| `astrologers-status` | `UPDATE` on `users` (role=astrologer) | Notifies client when an astrologer goes online/offline. |
| `incoming-requests-channel`| `INSERT/UPDATE` on `chat_sessions` | Notifies astrologer of new/cancelled chat requests. |
| `session-{sessionId}` | `UPDATE` on `chat_sessions` | Notifies client if the astrologer accepts/declines the chat. |
| `active-session-{sessionId}`| `UPDATE` on `chat_sessions` | Notifies astrologer if the client ends the chat early. |
| `messages-{sessionId}` | `INSERT` on `chat_messages` | Real-time chat messages for both sides. |

## 4. UI Trigger Points (User Actions)

Here are the specific UI buttons and the logic they trigger:

### Auth & Navigation
* **Login Button**: Calls `/api/auth/email-by-phone` if needed, then `supabase.auth.signInWithPassword()`.
* **Signup Button**: Calls `supabase.auth.signUp()`.
* **Logout Button**: Calls `supabase.auth.signOut()` and clears local storage.

### Shopping Experience
* **Add to Cart**: Sends `POST /api/cart` if logged in. Otherwise updates `localStorage("aroham_cart")`.
* **Buy Now**: Sends `POST /api/cart/buy-now`. If logged out, saves to `localStorage("aroham_buy_now_intent")`.
* **Cart Quantities (+ / - / Trash)**: Calls `PUT` or `DELETE` on `/api/cart/{id}`.
* **Proceed to Payment**: Validates address form and calls `POST /api/addresses`.
* **Pay Now**: Calls `POST /api/orders`, receives Razorpay config, and opens the Razorpay modal.

### Astrologer Chat (Client Side)
* **Start Consultation**: Inserts a new row into `chat_sessions` (Status: PENDING).
* **Cancel Request**: Updates the `chat_sessions` row (Status: DECLINED).
* **Send Message**: Inserts into `chat_messages`.
* **End Session**: Updates `chat_sessions` (Status: COMPLETED).

### Astrologer Dashboard
* **Toggle Status**: Updates the astrologer's `is_online` column in the `users` table.
* **Accept Consultation**: Updates the `chat_sessions` row (Status: ACCEPTED).
* **Decline Consultation**: Updates the `chat_sessions` row (Status: DECLINED).
* **Recommend Remedy**: Sends a special formatted message (`REMEDY:Name|Emoji|Desc`) to `chat_messages`.
