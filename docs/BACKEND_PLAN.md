# Basic French (`basicfrench.org`) — Backend & Authentication Setup Guide

This application uses **Supabase** (PostgreSQL + GoTrue OAuth) for optional cross-device progress synchronization, while maintaining a 100% functional **Guest Mode** via browser `localStorage` when unauthenticated or when environment variables are omitted.

## 1. Environment Variables

Create a `.env` file locally (or configure in Netlify → **Site configuration → Environment variables**):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

> **Security Note:** Never put your Supabase `service_role` key in frontend environment variables. Only `VITE_SUPABASE_ANON_KEY` belongs in client builds; data isolation is enforced at the database layer via PostgreSQL Row Level Security (RLS).

## 2. Database Schema & Row Level Security (RLS)

1. Open your Supabase project → **SQL Editor → New Query**.
2. Paste the contents of [`docs/schema.sql`](./schema.sql) and click **Run**.
3. Verify that both `public.quiz_sessions` and `public.word_progress` show **RLS Enabled** and `anon` table privileges are revoked.

## 3. OAuth Providers (Google, Microsoft Entra ID, GitHub)

In Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://basicfrench.org`
- **Redirect URLs:**
  - `https://basicfrench.org`
  - `https://basicfrench.org/*`
  - `http://localhost:5175`

Enable **Google**, **Azure (Microsoft Entra ID)**, and/or **GitHub** under **Authentication → Providers**, using `https://basicfrench.org/privacy` and `https://basicfrench.org/terms` for OAuth consent screen verification URLs.
