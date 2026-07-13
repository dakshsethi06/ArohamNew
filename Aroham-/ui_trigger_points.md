# UI Trigger Points & Endpoints Mapping

This is a comprehensive mapping of all interactive elements (buttons/forms) in the current UI, their associated trigger functions, and the backend/Supabase endpoints they interact with. The new UI will need to wire its buttons to these corresponding actions.

## 1. Authentication (Login & Signup)
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Login Submit** | `handleLogin(e)` | `GET /auth/email-by-phone?phone={num}`<br/>`supabase.auth.signInWithPassword()` | Looks up email by phone (if digits entered), then authenticates via Supabase. |
| **Signup Submit** | `handleSignup(e)` | `supabase.auth.signUp()` | Creates a new user in Supabase. |
| **Logout** | `link.onclick` | `supabase.auth.signOut()` | Clears session and local storage. |

## 2. Products & Home Page
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Add to Cart** | `addToCart(product)` | `POST /api/cart`<br/>(Fallback: `localStorage`) | Adds item to DB cart if logged in, else adds to local storage. |
| **Buy Now** | `buyNow(product)` | `POST /api/cart/buy-now`<br/>(Fallback: `localStorage`) | Creates a temporary cart session and redirects straight to checkout. |

## 3. Shopping Cart & Checkout
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Increase/Decrease Qty (+/-)** | `changeQty(id, delta)` | `PUT /api/cart/{id}`<br/>`DELETE /api/cart/{id}` | Updates quantity or removes item if qty reaches 0. |
| **Remove Item (Trash icon)** | `removeItem(id)` | `DELETE /api/cart/{id}` | Removes the item from the cart. |
| **Proceed to Payment** | `proceedToPayment(e)` | `POST /api/addresses` | Validates delivery details and saves the address to the user's profile. |
| **Pay Now** | `payNow()` | `POST /api/orders` | Creates a Razorpay order ID and opens the payment modal. |
| **(Razorpay Success)** | `verifyPayment(orderId, res)` | `POST /api/payments/verify` | Verifies the signature of the successful payment. |
| **(Razorpay Dismiss/Fail)** | `reportFailure(orderId, err)` | `POST /api/payments/failed` | Logs payment failure/abandonment. |

## 4. User Profile & Orders
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Save Profile Details** | `saveProfileDetails(e)` | `POST /api/auth/profile` | Updates user's demographic & birth details. |
| **Order Card Click** | `toggleOrderDetails(el)` | (UI Only) | Expands/collapses order details. Initial load calls `GET /api/orders`. |

## 5. Client Chat (Consult Astrologer)
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Start Live Consultation** | `initiateConsultationRequest(id)` | `INSERT INTO chat_sessions` (Supabase) | Creates a new pending chat session. |
| **Cancel Request** | `cancelConsultationRequest()` | `UPDATE chat_sessions` (Supabase) | Sets session status to `DECLINED`. |
| **Send Message** | `sendLiveMessage(e)` | `INSERT INTO chat_messages` (Supabase) | Sends a chat message in an active session. |
| **End Chat Session** | `endChatSession()` | `UPDATE chat_sessions` (Supabase) | Sets session status to `COMPLETED`. |

## 6. Astrologer Dashboard
| Action / Button | JS Trigger | Backend / Supabase Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Accept Request** | `acceptRequest(id, name)` | `UPDATE chat_sessions` (Supabase) | Sets status to `ACCEPTED` to start the chat. |
| **Decline Request** | `declineRequest(id)` | `UPDATE chat_sessions` (Supabase) | Sets status to `DECLINED`. |
| **Toggle Online Status** | `toggleOnlineStatus()` | `UPDATE users` (Supabase) | Toggles the astrologer's `is_online` flag. |
| **Recommend Product** | `recommendProduct(...)` | `INSERT INTO chat_messages` (Supabase) | Sends a specially formatted message (`REMEDY:...`) that renders as a product card for the client. |
