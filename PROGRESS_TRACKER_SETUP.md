# Progress Tracker — Setup

The `/apps/progress-tracker` page lets a user sign in with Google and log
daily workouts, food, and body metrics. The data lives in Supabase (Postgres
+ row-level security), so every user only sees their own rows.

Total setup time: ~10 minutes. Everything in the free tier.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com>, sign up / sign in.
2. Click **New project** → pick a name, region, generate a strong DB password
   (you won't need it again for this app).
3. Wait ~60s for it to provision.

## 2. Run the schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste the contents of `src/data/progressSchema.sql` and hit **Run**.
3. Confirm the four tables (`workout_sessions`, `workout_entries`,
   `diet_entries`, `body_metrics`) exist under **Table Editor** with
   Row-Level Security enabled.

## 3. Enable Google OAuth

### A. In Google Cloud Console

1. <https://console.cloud.google.com/apis/credentials>.
2. Create OAuth consent screen (External, just your email as test user
   is fine for development).
3. **Credentials → Create Credentials → OAuth Client ID → Web application**.
4. Authorized redirect URI — copy the exact callback URL shown in the
   Supabase dashboard at **Authentication → Providers → Google**
   (usually `https://YOUR_PROJECT.supabase.co/auth/v1/callback`).
5. Save. Copy the **Client ID** and **Client Secret**.

### B. In Supabase

1. **Authentication → Providers → Google** → toggle **Enable**.
2. Paste the Client ID and Client Secret. Save.

## 4. Wire up env vars

Get your project URL and anon key from Supabase: **Project Settings → API**.

### Locally

Create a `.env` at the repo root:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJ... (anon public key, NOT service_role)
```

Restart the dev server.

### On Netlify

**Site Configuration → Build & deploy → Environment → Environment variables**,
add the same two keys. Redeploy.

## 5. Done

Visit `/apps/progress-tracker`. Click **Continue with Google**. Log your
first workout.

---

## Notes

- The **anon key** is safe to ship in the frontend bundle because Row-Level
  Security is enforced server-side — users literally cannot read or write
  other users' rows.
- The **service_role key** must NEVER be put in env vars that end up in the
  frontend. Only use it for server-side scripts if you ever add any.
- If you ever reset the database, just re-run `progressSchema.sql`.
