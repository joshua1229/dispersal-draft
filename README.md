# Dispersal Draft App

Fantasy football dispersal draft tool — pulls rosters from Sleeper, runs a live snake draft from a pool of players and picks.

## Deploy to Vercel (5 minutes)

### Option A: GitHub (recommended)
1. Create a new GitHub repo and push this folder to it
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — just click **Deploy**
4. Done. Your app is live at `https://your-project.vercel.app`

### Option B: Vercel CLI
```bash
npm install -g vercel
cd dispersal-draft
npm install
vercel
```
Follow the prompts — it deploys in about 60 seconds.

## How the proxy works

`/api/sleeper.js` is a Vercel serverless function that proxies all requests to `api.sleeper.app`. This bypasses the browser CORS restriction. The `/players/nfl` endpoint (large payload) is cached for 24 hours at the edge.

## Local development

```bash
npm install
npx vercel dev   # runs both the Vite frontend and the /api proxy locally
```

> Use `vercel dev` instead of plain `npm run dev` so the `/api/sleeper` proxy works locally too.

## How to find your Sleeper League ID

Sleeper app → tap your league → Settings → scroll to the bottom → copy the League ID (long number).
