// Game catalogue shown on the landing page.
// To publish a game: set `route` (and add the <Route> in main.jsx).
// Games without a route are shown as "Coming soon".

export const CATEGORIES = [
  { id: "3d", label: "3D Interactives", short: "3D", icon: "🧊", blurb: "Explore real-life places and objects in 3D." },
  { id: "2d", label: "2D Games", short: "2D", icon: "🎨", blurb: "Simple, colourful games that work on any device." },
  { id: "ar", label: "AR Experiences", short: "AR", icon: "📱", blurb: "Bring everyday objects into your own room." },
  { id: "vr", label: "VR Experiences", short: "VR", icon: "🥽", blurb: "Practise trips and tasks in a safe virtual world." },
];

// cover: background gradient, emoji "stickers" and title colours for the card art.
export const GAMES = [
  {
    id: "pack-your-bag",
    category: "3d",
    title: "Pack Your Bag",
    skill: "School routines",
    levels: 4,
    route: "/games/pack-your-bag",
    cover: {
      bg: "linear-gradient(160deg, #4fb0d9 0%, #a8e0f2 55%, #8fc957 56%, #6fae45 100%)",
      title: ["#a6e3a1", "#a7d8fb", "#d4b8f0"],
      art: ["🎒", "📘", "✏️", "🍱"],
      wrong: "🧸",
    },
  },
  {
    id: "animal-world",
    category: "3d",
    title: "Animal World",
    skill: "Nature & animals",
    cover: {
      bg: "linear-gradient(160deg, #8fd3f4 0%, #c8f0c0 55%, #6dbb5a 100%)",
      title: ["#ffd23f"],
      art: ["🐘", "🦁", "🐯", "🐰"],
    },
  },
  {
    id: "dining-table",
    category: "3d",
    title: "Arranging Dining Table",
    skill: "Home & mealtimes",
    cover: {
      bg: "linear-gradient(160deg, #7fd1d6 0%, #b9ecec 60%, #9fb4c2 100%)",
      title: ["#ffffff"],
      art: ["🍽️", "🥄", "🥛", "🪑"],
    },
  },
  {
    id: "first-aid",
    category: "3d",
    title: "First Aid",
    skill: "Safety & health",
    cover: {
      bg: "linear-gradient(160deg, #a9b8f5 0%, #dfe4ff 100%)",
      title: ["#ffd23f"],
      art: ["🩹", "🧴", "🩺", "🧊"],
    },
  },
  {
    id: "washing-clothes",
    category: "3d",
    title: "Washing Clothes",
    skill: "Self-care & laundry",
    cover: {
      bg: "linear-gradient(160deg, #bfe3ff 0%, #f1f8ff 100%)",
      title: ["#4ab3f4"],
      art: ["🧺", "🫧", "👕", "🧦"],
    },
  },
  {
    id: "kitchen-bonanza",
    category: "3d",
    title: "Kitchen Bonanza",
    skill: "Cooking & kitchen safety",
    cover: {
      bg: "linear-gradient(160deg, #a8e6cf 0%, #a8e6cf 50%, #f7c873 51%, #f2b45a 100%)",
      title: ["#e2475a"],
      art: ["🍳", "🥕", "🍲", "🧂"],
    },
  },
];
