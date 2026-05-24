<p align="center">
  <div align="center">
    <a href="https://anizen.site/">
      <img alt="AniZen" src="public/logo.png" width="220"/>
    </a>
  </div>
  <h3 align="center">AniZen — Free Anime Streaming Platform</h3>
  <p align="center">
    <a href="https://github.com/anizenn/Anizen-React-App">
      <img src="https://img.shields.io/github/stars/anizenn/Anizen-React-App" alt="Github Stars">
    </a>
    <img src="https://img.shields.io/github/issues/anizenn/Anizen-React-App" alt="Github Issues">
    <a href="https://github.com/anizenn/Anizen-React-App">
      <img src="https://img.shields.io/github/forks/anizenn/Anizen-React-App" alt="Github Forks"/>
    </a>
  </p>
</p>

---

<details>
<summary>✨ Features</summary>

### General
- Sub & Dub anime support
- User-friendly interface
- Mobile responsive
- Fast page load with in-memory caching
- Character & Voice Actor info
- Anime schedule & next episode countdown
- Search with live suggestions
- Browse by genre, category, A-Z

### Watch Page
- Multiple streaming servers with automatic fallback
- Recommended anime
- Available seasons
- Estimated schedule for upcoming episodes
- **Player**
  - Autoplay
  - Auto-skip intro/outro
  - Auto-next episode

### User Accounts
- Register / Login / Forgot password
- Profile page with avatar upload
- Continue watching history
- Auto-skip preference setting

### Security
- Service Worker with rate limiting & request interception
- DevTools detection
- Blocked malicious URL patterns
- Keyboard shortcut protection

</details>

---

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS, React Router v6
- **Data** — AniList GraphQL API
- **Streaming** — AnimeKai (scraped via Cloudflare Worker proxy) + AniKoto fallback
- **Auth & Backend** — PocketBase (self-hosted)
- **Deployment** — Cloudflare Pages (frontend) + Cloudflare Worker (API proxy)

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/anizenn/Anizen-React-App.git
cd Anizen-React-App
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
VITE_POCKETBASE_URL=http://localhost:8090
VITE_IMAGE_PROXY_ENABLED=false
VITE_MAINTENANCE_MODE=false
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> The Vite dev server includes a built-in proxy for `/anikai` and `/anikoto` routes so you don't need the Cloudflare Worker running locally.

---

## Deployment

### Cloudflare Pages (Frontend)

```bash
npm run build
wrangler pages deploy dist --project-name=anizen-react-app
```

Or connect your GitHub repo in the Cloudflare dashboard:
- **Build command:** `npm run build`
- **Output directory:** `dist`

Set these environment variables in **Cloudflare Pages → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_POCKETBASE_URL` | `https://your-pocketbase.yourdomain.com` |
| `VITE_IMAGE_PROXY_ENABLED` | `false` |
| `VITE_MAINTENANCE_MODE` | `false` |

### Cloudflare Worker (API Proxy)

```bash
cd worker
npm install
wrangler deploy --env=production
```

Set the AnimeKai session cookie as a secret:

```bash
wrangler secret put ANIKAI_COOKIE
```

Create the R2 bucket for avatars (enable R2 in Cloudflare dashboard first):

```bash
wrangler r2 bucket create anizen-uploads
```

### PocketBase (Auth Backend)

PocketBase is a self-hosted binary. Recommended hosting options:
- [Railway.app](https://railway.app) — free tier
- [Fly.io](https://fly.io) — free allowance
- Any $4–6/mo VPS (Hetzner, DigitalOcean)

Set the public HTTPS URL as `VITE_POCKETBASE_URL` in your Pages environment variables.

---

## Docker

```bash
docker build -t anizen .
docker run -d -p 5173:80 anizen
```

---

## Contributing

Pull requests are welcome for bug fixes, improvements, or new features.

- Fork the repository and create a new branch for your changes
- Ensure your code follows the existing coding style
- Describe your changes clearly in the pull request

### Reporting Issues

If you find a bug or have a suggestion, please open an issue with a clear description, steps to reproduce, and your environment details.

---

### Support

If you like the project, feel free to drop a ⭐. Your support means a lot.

<p align="center">Made with 🫰 by <a href="https://github.com/anizenn" target="_blank">anizenn</a></p>