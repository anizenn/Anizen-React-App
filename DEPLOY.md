# Deploying to Cloudflare

## One-time setup

```bash
npm install -g wrangler
wrangler login
```

---

## 1 — Deploy the Worker (API proxy)

```bash
cd worker
npm install
wrangler deploy
# → live at https://anizen-api.<your-account>.workers.dev
```

Set the AnimeKai cookie secret (from vite.config.js):
```bash
wrangler secret put ANIKAI_COOKIE
# paste: __p_mov=1; usertype=guest; session=vLrU4aKItp0QltI2asH83yugyWDsSSQtyl9sxWKO
```

Create the R2 bucket for avatars:
```bash
wrangler r2 bucket create anizen-uploads
```

---

## 2 — Deploy the Frontend (Pages)

```bash
cd ..           # back to project root
npm run build
wrangler pages deploy dist --project-name=anizen
```

Or connect GitHub repo in the Cloudflare dashboard:
- Build command: `npm run build`
- Output directory: `dist`

---

## 3 — Set environment variables in CF Pages dashboard

Settings → Environment Variables → Production:

| Key | Value |
|-----|-------|
| `VITE_POCKETBASE_URL` | `https://your-pocketbase.yourdomain.com` |
| `VITE_IMAGE_PROXY_ENABLED` | `false` |
| `VITE_MAINTENANCE_MODE` | `false` |

---

## 4 — Point Worker routes at your domain

In `worker/wrangler.toml`, the `routes` block already maps:
- `anizen.site/anikai/*` → Worker
- `anizen.site/anikoto/*` → Worker
- `anizen.site/proxy/*` → Worker

The frontend clients (`/anikai`, `/anikoto`) require no code changes — 
they use relative paths, which hit the Worker in production 
and the Vite dev proxy in development.

---

## PocketBase hosting options

PocketBase is a single binary — you need to host it somewhere with a public URL:
- **Cheapest**: Railway.app free tier or Fly.io (free allowance)
- **VPS**: Any $4/mo DigitalOcean/Hetzner droplet
- Set `VITE_POCKETBASE_URL` to its public HTTPS URL above
