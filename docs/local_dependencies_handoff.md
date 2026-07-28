# ⚠️ Local Environment & Account Dependencies Handoff

This document outlines everything in the `ArohamNew` codebase that is tightly coupled to the original developer's local PC environment, specific cloud accounts, or hardcoded testing values. 

The next developer working on this project MUST review this list to configure their own environment properly.

## 1. Cloud Accounts & API Keys (`.env`)
The project relies on specific cloud services. You will need to provision your own accounts or obtain the original `.env` file from the previous developer.

* **Supabase (PostgreSQL):**
  * The backend connects to a specific Supabase instance (currently `https://lzzdfsphevmzbkkoskxb.supabase.co`).
  * You need the `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  * **Dependency:** The Supabase database contains the `products` table, which is required for the 3-tier fallback recommendation engine to work.
* **Groq LLM API:**
  * The AI Chatbot (`AstroGuide`) uses the Groq Cloud API for `llama-3.3-70b-versatile`.
  * You need a personal `GROQ_API_KEY`.
* **Razorpay / Shiprocket:**
  * If you plan to test the checkout pipeline, you will need your own test keys for Razorpay and Shiprocket (if not already present in the shared `.env`).

## 2. Localhost Network & Port Bindings
The system assumes a specific microservice port architecture running on `localhost`:

* **Frontend (React/Vite):** Assumes it is running on `http://localhost:5173`.
* **Backend (Express):** Assumes it is running on `http://localhost:5000`.
  * *Note:* The frontend `AstroChatWidget.tsx` and `ShopPage.tsx` have fallback base URLs pointing directly to `http://localhost:5000` if `VITE_API_BASE_URL` is missing.
* **Gorse ML Engine:** Assumes it is running on `http://localhost:8088`.

## 3. Gorse ML Docker Container
The recommendation engine requires Gorse to be running locally via Docker. It is **not** hosted in the cloud.
* **What you need to do:** You must install Docker and spin up the Gorse container manually.
* **Command:** `docker run -p 8088:8088 zhenghaoz/gorse-in-one`
* **Dependency:** Without this container, the backend will fallback to Supabase bestsellers (Tier 3 fallback).

## 4. Hardcoded Testing Values (Tech Debt)
During development, a few fallback identifiers were hardcoded into the backend routes to streamline testing. You may want to refactor these for production:

* **Fallback User ID (`user_demo_123`):** 
  * In `backend/routes/chat.js`, if a request arrives without a `userId`, it defaults to `user_demo_123`.
* **Fallback Kundali Profile (`Yashasvi Solanki`):** 
  * In `backend/routes/chat.js` and `backend/routes/recommendations.js`, if a user hasn't generated a Kundali PDF during their session, the system temporarily falls back to `global.kundaliProfiles["Yashasvi Solanki"]` to demonstrate Astrological Soft-Boosting. 
  * *Action Required:* You should remove the `|| global.kundaliProfiles["Yashasvi Solanki"]` logic in these files before deploying to real users, so that only the actual logged-in user's profile is used.

## 5. Session & Storage Dependencies
* **Browser Storage:** The frontend uses `sessionStorage` (key: `aroham_astro_chat_history`) to maintain chat history and `localStorage` (key: `aroham_guest_user_id`) to track anonymous users for Gorse ML. Clearing your browser cache will reset these.
* **Global Memory Cache:** The backend stores generated Kundali profiles in a Node.js `global.kundaliProfiles` object. Restarting the backend server (`node server.js`) will wipe this memory cache, requiring you to generate a new Kundli PDF to test recommendation boosting.
