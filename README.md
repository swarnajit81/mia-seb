# Sunday? 💕

A playful Next.js mini-site that asks "Would you go out with me on Sunday?" — with:

- A custom animated cursor (glowing dot + pulsing ring)
- A heart / sparkle trail that follows the mouse
- A **Yes** button that grows bigger every time you hover over it
- A **No** button that runs away from the cursor and changes its label
- A confetti + rainbow celebration screen when Yes is clicked
- Animated gradient background with floating blobs

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Files

- `app/page.tsx` — the whole experience (cursor, dodging No button, celebration)
- `app/layout.tsx` — root layout
- `app/globals.css` — base styles + `cursor: none`
- `package.json`, `next.config.js`, `tsconfig.json` — Next.js setup

## Want to preview without installing anything?

Open `preview.html` in a browser — it's a standalone version with the exact same feel.
