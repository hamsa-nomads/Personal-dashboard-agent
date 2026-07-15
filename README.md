# Dayframe — Personal Dashboard Agent

A private, mobile-first work operating system for Leah and Moshe. It is preloaded with the active SharePoint, Hamsa Nomads, USCIS, Torah Tinkers, Catanlike, expense, exercise, and Ava workflows discussed in ChatGPT.

## What works

- Time-aware **Now** screen and 50-minute focus timer
- Automatic day planning with breaks, lunch, movement, deadlines, and owner filters
- Leah / Moshe / Shared project ownership
- Installable iPhone and desktop PWA
- Offline cache and local device persistence
- Optional free Supabase synchronization between devices
- Real standards-based Web Push with VAPID
- Private server-side access-code gate
- Voice input and spoken replies through the browser Web Speech APIs
- Local command agent: replan, start, pause, finish, block, switch owner, recommend a short task, and capture tasks
- Client-side ChatGPT `conversations.json` task extraction with review before approval
- JSON backup export

The coach is intentionally local and deterministic. It does not send work data to a paid LLM API.

## Local use

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without environment variables, the dashboard still works locally with device-only storage. The passcode gate is bypassed in local development when `AUTH_SECRET` is absent.

## Free deployment

### 1. Supabase

Create a free Supabase project and run `supabase/schema.sql` in the SQL editor. Copy the project URL and **service role** key into the deployment environment. The service-role key must never be exposed in browser code.

### 2. VAPID keys

```bash
npx web-push generate-vapid-keys
```

Add the generated public/private keys to the deployment environment. Set `VAPID_SUBJECT` to a `mailto:` address.

### 3. Private access

Generate two unrelated long secrets:

```bash
openssl rand -base64 36
openssl rand -base64 36
```

Use one as `AUTH_SECRET` and one as `CRON_SECRET`. Set a private `DASHBOARD_ACCESS_CODE` that Leah and Moshe will use. Do not commit any `.env` file.

### 4. Deploy to Vercel

Import this private GitHub repository into a free Vercel project and add all variables from `.env.example`. Redeploy after saving them.

### 5. Schedule background push

Deploy `supabase/functions/ping-push` as a Supabase Edge Function. Add two function secrets:

- `DASHBOARD_URL`: the production Vercel URL
- `CRON_SECRET`: exactly the same value used in Vercel

Schedule the `ping-push` function every five minutes in Supabase Cron. The function calls `/api/push/send`, which sends all due reminders and disables expired subscriptions.

### 6. iPhone installation

1. Open the deployed site in Safari.
2. Tap **Share** → **Add to Home Screen**.
3. Open Dayframe from its new Home Screen icon.
4. Sign in and tap **Enable alerts**.
5. Accept notification permission.

On desktop, open the deployed site in a supported browser and tap **Enable alerts**.

## Voice coach examples

- “What should I do next?”
- “Plan my day.”
- “Start focus.”
- “Pause.”
- “Finish this task.”
- “I have 20 minutes.”
- “I am tired.”
- “Show Moshe.”
- “Add task: call the Lake George campground.”

Speech recognition availability depends on the browser. Typed commands always remain available, and spoken responses use the browser's speech-synthesis voices.

## Privacy and security

- The application is protected by a server-verified access code when `AUTH_SECRET` is configured.
- The session cookie is HTTP-only, secure in production, and same-site strict.
- Supabase tables have row-level security enabled and no public policies.
- Supabase's service-role key and VAPID private key remain server-side.
- ChatGPT export parsing happens locally in the browser.
- Push notification text is stored in Supabase until sent.

For stronger identity separation or MFA, replace the shared-code gate with Supabase Auth before expanding access beyond Leah and Moshe.

## Validation

```bash
npm run typecheck
npm run build
```
