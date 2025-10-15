# 🌊 VIBE — AI-Powered Activity Recommendation App

## PROJECT OVERVIEW
**Vibe** is a minimalist, AI-powered mobile application that recommends real-world activities in Romania based on the user's current mood.  
Users type their vibe (e.g., "I feel adventurous" or "I want something cozy"), and Vibe suggests things to do — from cafés and hiking trails to creative workshops and skydiving.  

The app's mission is to help people rediscover life beyond screens, go outside their comfort zones, and engage with local businesses that match how they feel in the moment.

---

## LEVEL
Medium

---

## TYPE OF PROJECT
AI Development · Mobile Application · Lifestyle & Tourism Personalization

---

## SKILLS REQUIRED
- React Native (Expo)  
- TypeScript / JavaScript  
- AI Integration (OpenAI API or NLP models)  
- API Integration (TripAdvisor via RapidAPI)  
- Supabase (Auth, Database, Storage)  
- UI/UX Design (NativeWind, Reanimated/Moti)  
- Backend Security & Best Practices  

---

## CLIENT INFORMATION
Independent developer building **Vibe** — a human-centered, AI-driven app that reconnects people with real experiences and helps Romanian small businesses be discovered.

---

## KEY FEATURES

### 1. Core Experience & AI Engine
- AI interprets user mood text into actionable tags (e.g., adventurous → hiking, skydiving).  
- Live data via **TripAdvisor API (RapidAPI)** for activity discovery.  
- Minimalist "What's your vibe?" typing interface with suggestion chips and smooth transitions.  

### 2. Contextual Personalization
- Filters recommendations by:
  - Season and weather
  - Distance and willingness to travel
  - Budget range
  - Type (outdoors, cozy, social, creative)  
- Presents results as elegant "activity cards" with imagery, description, and map links.

### 3. Business Integration (Later)
- Supabase backend for curated partner listings.
- Verified businesses can appear as promoted experiences.

### 4. Extended Intelligence (Future)
- Conversational AI for follow-ups ("What about something creative near Brașov?").  
- Saved vibes and favorites.  
- Weather-aware recommendations and weekend planning.

---

## CORE FEATURES SUMMARY

| Feature | Description |
|----------|-------------|
| Vibe Input Bar | Animated input to capture how the user feels |
| AI Mood Parser | NLP / AI model to classify mood and map to activities |
| Recommendation Engine | Fetches real-time data from TripAdvisor API |
| Activity Cards | Visual feed of experiences (photo, distance, rating, CTA) |
| Seasonal Logic | Time and weather-based filtering |
| Partner Integration | Business listings from Supabase |
| Light Mode UI | Modern, airy, social feel |
| Geolocation | Personalized results by proximity |

---

## TECHNOLOGY STACK

| Layer | Technology |
|--------|-------------|
| **Frontend (Mobile)** | React Native + Expo |
| **Styling** | NativeWind (Tailwind RN), Moti/Reanimated |
| **Backend API** | Node.js + Express (Replit/Windsurf runtime) |
| **Database** | Supabase (partners, analytics) |
| **External Data** | TripAdvisor via RapidAPI |
| **AI Layer** | Rule-based NLP (v1) → GPT-powered classification (v2) |
| **Hosting** | Windsurf container runtime or Replit Deployments |

---

## DESIGN LANGUAGE
- **Visual:** Light, minimal, smooth transitions.  
- **Typography:** Inter / SF Pro — rounded and readable.  
- **Tone:** Calm, motivational, and familiar.  
- **Aesthetic goal:** ChatGPT × Instagram Direct — immersive yet clean.  
- **Logo:** "vibe" in lowercase with subtle waveform iconography.  

---

## SUCCESS METRICS
| Metric | Target |
|--------|--------|
| Time-to-first-recommendation | < 4s |
| Crash-free sessions | > 99% |
| Activity engagement | ≥ 60% of sessions |
| Rate-limit trigger rate | < 1% of total requests |

---

## ETHICAL & SOCIAL CONSIDERATIONS
- Encourage healthy, inclusive activities for all demographics.  
- Avoid urban-only bias — feature rural & local experiences.  
- Ensure data privacy — no permanent location storage.  
- Keep AI recommendations transparent and explainable.

---

# ⚙️ WINDSURF DEVELOPMENT RULES & POLICIES

These are **non-code operational and security rules** Windsurf should follow when generating, modifying, or deploying code for this project.  
They define **development constraints, safety limits, and system protections**.

---

## 1. CODE SCOPE RULES
- Use **TypeScript** everywhere (frontend + backend).  
- Keep changes **minimal and purposeful**; never perform mass rewrites or remove security layers.  
- Do **not** modify configuration files unless explicitly asked.  
- Never delete middleware related to:  
  - Rate limiting  
  - CAPTCHA verification  
  - Input validation  
  - CORS or helmet security headers  
- Ensure all code additions align with this PRD's purpose (AI-powered activity recommendation app).

---

## 2. SECURITY ENFORCEMENT
- All API endpoints must include **rate limiting**.  
  - Global limit: **300 requests / 15 minutes / IP**  
  - Auth routes: **50 requests / 15 minutes / IP**  
  - External API proxy: **60 requests / minute / IP**
- All signup or login routes must verify **CAPTCHA** (hCaptcha or reCAPTCHA) tokens server-side.  
- Limit JSON payloads to **100KB**.  
- Deny multipart uploads on public routes.  
- Enforce **CORS** using a list of allowed origins (`CORS_ORIGINS` in environment variables).  
- Never log API keys, tokens, or user data.

---

## 3. BACKEND RULES
- Use **Express.js** with `helmet()`, `cors()`, and `express-rate-limit()` middlewares.  
- Use **Zod** for input validation.  
- Keep all secrets in environment variables (`RAPIDAPI_KEY`, `SUPABASE_URL`, etc.).  
- Error responses must be **structured JSON** (`{ error: "type", message: "details" }`).  
- Add health endpoints (`/health`) for uptime checks.

---

## 4. FRONTEND RULES
- Maintain a **light-mode UI** only for MVP.  
- Keep components modular (`/screens`, `/components`, `/services`).  
- Use **NativeWind** for consistent styling; avoid inline styles.  
- Use **Moti/Reanimated** for animations.  
- Always display a loading shimmer or spinner for API calls.  
- On API error, show a friendly empty state — never crash.

---

## 5. API DATA RULES
- TripAdvisor data fetched from RapidAPI only via a server proxy.  
- Sanitize all query parameters to prevent injection.  
- Normalize data into a standard internal `Activity` format before use.  
- Limit displayed activities to **10–15 per query** to control API usage.

---

## 6. CHANGE MANAGEMENT
- Each code update should address **a single feature or fix**.  
- Commit messages must include a summary (e.g., `feat: add AI vibe parser`).  
- Windsurf should avoid simultaneous edits in unrelated files.  
- Never remove or rewrite functioning code unless explicitly instructed.  
- No auto-format or bulk lint changes unless requested.

---

## 7. DEPLOYMENT POLICY
- Deploy from **main** branch only.  
- Auto-restart on crash but with cooldown to prevent loops.  
- Revert to last stable version after 3 consecutive failed runs.  
- Log all 5xx responses with timestamp and route.

---

## 8. PRIVACY & DATA RETENTION
- User data (vibes, location) processed only transiently; not stored permanently.  
- Analytics anonymized and aggregated.  
- Partner/business data stored securely in Supabase.

---

## 9. AUDIT & MONITORING
- Maintain lightweight logs (API usage, rate-limit triggers).  
- Rotate logs weekly; no PII retention.  
- Include `/health` and `/metrics` endpoints for monitoring.

---

## 10. STABILITY RULES
- Windsurf must keep all files valid and compilable after changes.  
- Do not introduce new dependencies without listing rationale in comments.  
- Ensure that startup time and cold-boot latency remain < 2 seconds on Windsurf container.

---

## 11. EDITING PROTECTIONS
Windsurf must **not**:
- Remove or bypass rate-limit, validation, or captcha middleware.  
- Alter `.env` structure.  
- Modify `PRD.md` or this rules section without approval.  
- Commit generated test code to production folders.  
- Merge AI-suggested edits without validation.

---

## 12. DEVELOPMENT STYLE
- Follow clean, readable naming conventions.  
- Keep function length ≤ 40 lines when possible.  
- Favor composition over inheritance.  
- Add concise inline comments for logic sections that involve AI or filtering.

---

## 13. COMMUNICATION STYLE (AI PROMPTS)
When Windsurf assists during coding:
- Always summarize what's being changed and why.  
- Ask for confirmation before applying significant structural edits.  
- Reference relevant sections of this PRD when making recommendations.

---

# ✅ SUMMARY
This document defines:
- The **goal**, **scope**, and **architecture** of *Vibe*.  
- The **security**, **data**, and **change management** rules Windsurf must enforce.  
- The **standards** for stable, ethical, and minimal-impact AI-assisted development.

Windsurf should use this document as its **primary reference** when building, editing, or deploying code for the Vibe project.
