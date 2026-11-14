# Basic French (`basicfrench.org`)

[![CI](https://github.com/JohnBendfeldt/basic-french/actions/workflows/ci.yml/badge.svg)](https://github.com/JohnBendfeldt/basic-french/actions/workflows/ci.yml)
![React 19.3](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=white)
![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-105%20Passing-6E9F18?logo=vitest&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**Basic French** ([basicfrench.org](https://basicfrench.org)) is a fast, offline-ready, privacy-first Progressive Web App (PWA) for English speakers learning beginner French. Part of the [Basic Language School](https://basiclanguage.school) ecosystem alongside [Basic Russian](https://basicrussian.org) and [Basic English](https://basicenglish.school).

---

## Features

- **French Alphabet & Phonetics (`A–Z`)** — All 26 letters with IPA phonetic guides, beginner pronunciation cues, and 26 illustrated French example words.
- **374 Studio Neural Audio Recordings (`fr-FR-DeniseNeural`)** — Instant, crystal-clear native French audio for every letter, example word, phrase, number, time expression, and vocabulary word, with automatic `fr-FR` Web Speech API fallback and `0.7x` slow study playback.
- **Survival Phrases & Common Words** — Interactive tap-to-reveal flashcards (`Reveal All` / `Hide All`) covering polite greetings, travel, café orders, workplace phrases, and 246 everyday French words.
- **French Numbers (`0–1,000`) & Telling Time** — Dedicated counting guide for French vigesimal numbers (`soixante-dix`, `quatre-vingts`, `quatre-vingt-dix`) plus French time-telling grammar rules (`Il est une heure`, `et quart`, `et demie`, `moins le quart`, `midi`, `minuit`, and 24-hour schedules).
- **Adaptive Spaced-Repetition Quiz with French Accent Helper**:
  - Bidirectional `FR → EN` and `EN → FR` practice across `All Topics`, `Alphabet`, `Phrases`, `Numbers`, `Time`, and `Words` (`5`, `10`, or `20` questions per session).
  - **French Accent Quick-Insert Bar** (`é`, `è`, `ê`, `ë`, `à`, `â`, `ç`, `î`, `ï`, `ô`, `ù`, `û`, `œ`) + built-in **French Accent Marks Guide**.
  - **Accent-Forgiving Grading** — Accepts unaccented typing (e.g., `ca va` for `Ça va`) while highlighting exact French accents in the feedback drawer, plus French number equivalence and minor typo tolerance.
  - **3/3 Mastery Tracking** — Retires mastered items (`3/3`) so practice stays focused on weak spots.
- **Offline Guest Mode + Optional Cloud Sync** — Works 100% offline with zero sign-up required (`localStorage`), or sign in with **Google**, **GitHub**, or **Microsoft Entra ID** via Supabase OAuth to sync across devices.

---

## Tech Stack & Security Architecture

| Layer | Stack |
| :--- | :--- |
| **Frontend** | React 19.3, TypeScript 5.9, Vite 6.4 |
| **Offline PWA** | `vite-plugin-pwa` (Workbox precaching + `french-media` runtime audio cache) |
| **Audio Engine** | 374 pre-generated `fr-FR-DeniseNeural` MP3s + `fr-FR` / `fr-CA` Web Speech API fallback |
| **Auth & Cloud Sync** | Optional Supabase OAuth 2.0 + PostgreSQL Row-Level Security (`docs/schema.sql`) |
| **Testing & CI** | Vitest 5 + Testing Library + V8 Coverage, gated in GitHub Actions CI and `netlify.toml` |
| **Security Hardening** | Strict `script-src 'self'` Content Security Policy (zero inline scripts), HSTS `preload`, `X-Frame-Options: DENY`, `Permissions-Policy`, HTTPS-only URL validation, prototype-pollution-safe `localStorage` parsing, and `REVOKE ALL ... FROM anon` PostgreSQL RLS |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:5175)
npm start

# Run automated test suite
npm test

# Run tests with V8 code coverage report
npm run test:coverage

# Build production bundle & service worker
npm run build
```

---

## Optional Cloud Sync Setup (Supabase)

Basic French runs out of the box in **Guest Mode** with zero environment variables required. To enable cross-device OAuth sync:

1. Copy `.env.example` to `.env.local` and supply `VITE_SUPABASE_URL` (`https://...`) and `VITE_SUPABASE_ANON_KEY`.
2. Execute [`docs/schema.sql`](./docs/schema.sql) in the Supabase SQL Editor to provision `quiz_sessions` and `word_progress` with Row-Level Security (`auth.uid() = user_id`).
3. Enable Google, GitHub, and/or Azure (Entra ID) providers in Supabase Authentication and add `https://basicfrench.org` to Redirect URLs.

See [`docs/BACKEND_PLAN.md`](./docs/BACKEND_PLAN.md) for full architecture details.

---

## Contributing & Security

- **Contributing**: Native-speaker French translation fixes, accent/phonetic refinements, accessibility improvements, and bug fixes with tests are welcome — please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.
- **Security**: Please report suspected vulnerabilities privately rather than opening a public issue; see [`SECURITY.md`](SECURITY.md) for disclosure instructions.

---

## License

This project's source code is licensed under the MIT License © John Bendfeldt — Part of [Basic Language School](https://basiclanguage.school). See the [LICENSE](LICENSE) file for details.

> **Branding Note**: While the source code is open source under MIT, the **Basic French** / **Basic Language School** names, domain branding (`basicfrench.org`), and custom academic emblems are reserved for the official platform.
