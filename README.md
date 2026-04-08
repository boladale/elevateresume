# ElevateResume — ATS Resume Generator

Free ATS-compliant resume builder with AI-powered keyword analyzer and job search, built for Nigerian job seekers.

**Live:** [elevateresume.store](https://elevateresume.store)

---

## Features

- **7-step resume builder** — guided form with ATS tips at each step
- **ATS compliance score** — real-time scoring as users fill in sections
- **Keyword Analyzer** — paste a job description, AI compares it against the CV and identifies gaps
- **Job Search** — enter a role + location, AI searches Nigerian job boards (Jobberman, MyJobMag, LinkedIn, etc.)
- **PDF export** — clean, single-column, ATS-parseable output
- **Email capture gate** — 3 free AI uses per day, email unlocks unlimited
- **WhatsApp + Twitter sharing** — built-in viral sharing buttons
- **Premium template upsell** — modal linking to Shopify store with discount code

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI:** Anthropic Claude API (proxied through serverless API routes)
- **Hosting:** Vercel (recommended)
- **Styling:** Inline CSS with CSS variables (zero dependencies)

---

## Deployment Guide (Vercel)

### Step 1: Push to GitHub

```bash
cd elevateresume
git init
git add .
git commit -m "Initial commit — ElevateResume"
git remote add origin https://github.com/boladale/elevateresume.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import the `elevateresume` repository
4. Vercel auto-detects Next.js — no config needed
5. Add your environment variable:
   - `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
6. Click **Deploy**

### Step 3: Connect Your Domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `elevateresume.store`
3. Update your domain's DNS at your registrar:
   - **Option A (recommended):** Set nameservers to Vercel's
   - **Option B:** Add a CNAME record pointing to `cname.vercel-dns.com`
4. Vercel auto-provisions SSL

### Step 4: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add credits (the Sonnet model costs ~$3/1M input tokens)
3. Generate an API key
4. Add it to Vercel: **Settings → Environment Variables → `ANTHROPIC_API_KEY`**

---

## Cost Estimation

With the email gate limiting free users to 3 AI calls/day:

| Users/day | AI calls/day | Est. monthly cost |
|-----------|-------------|-------------------|
| 50        | ~100        | ~$2-5            |
| 500       | ~800        | ~$15-30          |
| 5,000     | ~5,000      | ~$80-150         |

These are rough estimates using Claude Sonnet pricing. The email gate is critical for cost control.

---

## Customization

### Change the Shopify store link
In `app/components/ResumeGenerator.jsx`, search for `elevateresume.store/templates` and update to your actual Shopify URL when ready.

### Change the discount code
Search for `FIRSTRESUME` and replace with your Shopify discount code.

### Adjust daily free limit
Set `DAILY_AI_LIMIT` in your Vercel environment variables, or edit the `DAILY_LIMIT` constant in `ResumeGenerator.jsx`.

### Add Google Analytics
Add your GA4 script to `app/layout.js` inside the `<head>` tag.

---

## Project Structure

```
elevateresume/
├── app/
│   ├── layout.js           # Root layout, SEO metadata, fonts
│   ├── page.js              # Home page
│   ├── globals.css          # Global styles, CSS variables, animations
│   ├── api/
│   │   ├── analyze/route.js # API proxy: keyword analysis
│   │   └── search/route.js  # API proxy: job search (with web search)
│   └── components/
│       └── ResumeGenerator.jsx  # Main app (all UI + logic)
├── .env.example             # Environment template
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## Marketing Channels (Nigeria-focused)

1. **WhatsApp groups** — NYSC groups, alumni groups, industry groups
2. **Twitter/X** — career advice threads with tool link
3. **Nairaland** — Career section posts
4. **LinkedIn** — "I built a free tool" posts
5. **SEO blog** — target "ATS CV Nigeria", "NYSC CV template", etc.
6. **Instagram Reels** — screen recordings of building a CV in 2 minutes

---

## License

MIT — free to use, modify, and distribute.
