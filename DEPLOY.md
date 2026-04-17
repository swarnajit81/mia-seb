# Deploy to GitHub + Vercel

The repo is already initialized and committed on the `main` branch. You just need to push it and connect Vercel.

## 1. Get the folder onto your computer

Download / copy the `date-site/` folder from your Cowork outputs to somewhere on your machine, then open a terminal inside it:

```bash
cd path/to/date-site
git log --oneline   # should show the initial commit
```

## 2. Create a GitHub repo and push

### Option A — GitHub CLI (fastest)

```bash
# one-time setup if you haven't already
gh auth login

# create the repo and push in one step
gh repo create sunday-date --public --source=. --remote=origin --push
```

### Option B — From the GitHub website

1. Go to <https://github.com/new>, name it `sunday-date`, leave it empty (no README, no .gitignore, no license).
2. Copy the remote URL GitHub shows you and run:

```bash
git remote add origin https://github.com/<your-username>/sunday-date.git
git push -u origin main
```

## 3. Deploy on Vercel

### Option A — Vercel dashboard (easiest)

1. Go to <https://vercel.com/new>.
2. Click **Import Git Repository** and pick `sunday-date`.
3. Vercel auto-detects Next.js — leave every setting at the default and click **Deploy**.
4. In ~60 seconds you'll get a URL like `https://sunday-date.vercel.app`.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel           # follow prompts, link to the repo
vercel --prod    # ship to production
```

## 4. Future updates

Every `git push` to `main` will trigger an automatic redeploy on Vercel. Pull requests get preview URLs automatically.

```bash
# edit files...
git add -A
git commit -m "tweak the question"
git push
```

## Notes

- `vercel.json` pins the framework to Next.js so Vercel doesn't need to guess.
- `.gitignore` already excludes `node_modules/`, `.next/`, and `.vercel/`.
- No environment variables are required — the site is fully client-side.
