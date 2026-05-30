# Deploy Checklist

## 1. Generate VAPID keys (run once in the project folder)
```bash
npx web-push generate-vapid-keys
```
Copy output into `.env.local`.

## 2. Final `.env.local` (all 6 vars required)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG4...
VAPID_PRIVATE_KEY=abc...
VAPID_SUBJECT=mailto:your@email.com
CRON_SECRET=any-long-random-string-you-choose
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

## 3. Test locally
```bash
npm run dev
# Open http://localhost:3000
# Log in → check-in → confirm points updated in Supabase dashboard
```

## 4. Deploy to Vercel
```bash
npm i -g vercel   # if not installed
vercel            # follow prompts, choose your account/team
```
Then in vercel.com → your project → Settings → Environment Variables:
- Add all 8 vars from step 2
- Set NEXT_PUBLIC_APP_URL to your actual .vercel.app URL

## 5. Trigger crons manually to verify (after deploy)
```
GET https://your-app.vercel.app/api/cron/daily-penalty
Authorization: Bearer <your CRON_SECRET>
```
Use Insomnia/Postman or `curl`:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-penalty
```

## 6. Add app to home screen (PWA)
- iPhone: Open app URL in Safari → Share → "Add to Home Screen"
- Android: Chrome shows "Install app" banner automatically

## 7. Remaining Supabase users
Pre-create users at: Supabase Dashboard → Authentication → Users → "Add user"
Then update seed.sql with their real UUIDs and run it.

## Notes
- Cron schedules are UTC. daily-penalty runs 02:00 UTC = 23:00 BRT ✓
- checkin-reminder runs 23:00 UTC = 20:00 BRT ✓  
- challenge-reminder runs Monday 12:00 UTC = 09:00 BRT ✓
- Vercel free plan supports up to 2 cron jobs; Pro plan = unlimited
