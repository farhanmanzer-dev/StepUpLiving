# Step Up Living

**Small steps to independent living.**
Friendly 2D, 3D, AR and VR games that help people with intellectual and developmental disabilities practise everyday life skills.

Built with **React 19, Vite 8, Three.js, GSAP and Framer Motion**.

## Run

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

The app uses hash routing and relative paths, so `dist/` works from any folder, on any static host, or inside an iframe.

| URL | Page |
| --- | --- |
| `#/` | Landing page and game library |
| `#/games/pack-your-bag` | Pack Your Bag (3D) |

## Landing page

- **Hero:** a Three.js scene of a character climbing a staircase of life skills (bag, meal, laundry, first aid, cooking, home), animated with a GSAP timeline. It loads after first paint and pauses when off-screen.
- **Game library:** tabs (All, 3D, 2D, AR, VR) and cards animated with Framer Motion. Unpublished games show "Coming soon".
- **Sections:** skills, how it works, accessibility, call to action, all revealed on scroll with GSAP ScrollTrigger.
- Respects `prefers-reduced-motion`.

## Adding a game

1. Put the game in `src/games/<game-id>/` with a default-exported React component.
2. Add a lazy route in `src/main.jsx`.
3. Add or update its entry in `src/site/games.js` and set `route`. Cards without a `route` show "Coming soon".

## Project layout

```text
src/
  main.jsx                  router (landing + lazy-loaded games)
  site/                     landing page
    Landing.jsx             page sections + GSAP animations
    games.js                game catalogue and categories
    hero/stepsScene.js      Three.js hero scene
    components/             navbar, logo, hero canvas, game cards, library tabs
    landing.css             styles (all classes prefixed "sl-")
  games/pack-your-bag/      Pack Your Bag game (see below)
```

## Pack Your Bag

Title → Learning Objectives → Level Selection → 4 levels (identify / pack, for school bag and lunch bag).
Voice instructions, automatic hints, stars saved per level, settings for brightness and music / sound / voice volume.
Built for low-end school PCs: renders only on change, 30 FPS cap, no shadow maps, nothing to download.

After each level it posts a result to the parent window (when embedded in a portal):

```js
{ type: "game-result", game: "pack-your-bag", gameId, level, mode, stars, accuracy,
  timeSeconds, correct, wrong, distractors, finishedAt }
```

Pass `?gameId=...` in the URL to have it echoed back.
