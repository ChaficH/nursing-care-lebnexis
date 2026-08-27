# Smart Home Healthcare Platform (nursing-care-lebnexis)

A platform that connects patients and families with home healthcare providers — nurses, physiotherapists, and mental health professionals — based on need, location, and availability.

Built as part of the **LebNexis Career Launch – Web Development Program**.

## The problem

Families often don't know which caregiver they need, who's available nearby, or how to compare options. Meanwhile, qualified providers struggle to find patients in their area. This platform matches both sides.

## How it works

1. A patient (or family member) describes their situation in plain language.
2. An AI service analyzes the description and suggests a relevant service category (e.g. physiotherapy, nursing) — it assists and triages, it does **not** diagnose.
3. The platform matches the request against providers by service type, location, and availability.
4. The patient reviews and requests a provider.

## MVP scope

- Patient & provider registration/profiles
- Patient request submission with AI-assisted categorization
- Provider search & matching by service, location, and availability
- Appointment requests (accept/reject)
- Cash payments only for now (no online payments/insurance yet)

## Tech stack (proposed)

- **Frontend:** React / Next.js
- **Backend:** Node.js and/or FastAPI (Python) for AI-heavy logic
- **Database:** PostgreSQL
- **AI:** External API (e.g. Gemini) for request analysis — not a custom-trained model
- **Dev environment:** Docker (see `README.md` deployment section / `CONTRIBUTING.md`)

Nothing above is finalized yet — the team is still validating the idea and may adjust the stack.

## Status

Early planning/validation stage. Idea submitted for approval; implementation begins after that. Not production-ready.
