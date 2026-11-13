// The four levels shown on the Level Selection screen.
//   mode "identify": tap every item that belongs.
//   mode "pack":     drag every item that belongs into the bag.
export const LEVELS = [
  {
    id: 1,
    title: "Identify School Bag items",
    short: "Find school things",
    mode: "identify",
    set: "school",
    bag: "school",
    art: "backpack",
    theme: "purple",
    intro: "Tap all the things we take to school!",
  },
  {
    id: 2,
    title: "Pack the School Bag",
    short: "Pack the school bag",
    mode: "pack",
    set: "school",
    bag: "school",
    art: "backpackOpen",
    theme: "blue",
    intro: "Pack your bag for school! Drag the things you need into the bag.",
  },
  {
    id: 3,
    title: "Identify Lunch Bag items",
    short: "Find lunch things",
    mode: "identify",
    set: "lunch",
    bag: "lunch",
    art: "lunchBag",
    theme: "green",
    intro: "Tap all the things for your lunch bag!",
  },
  {
    id: 4,
    title: "Pack the Lunch Bag",
    short: "Pack the lunch bag",
    mode: "pack",
    set: "lunch",
    bag: "lunch",
    art: "lunchBagFull",
    theme: "sun",
    intro: "Pack your lunch bag! Drag the food and drinks into the bag.",
  },
];

export const OBJECTIVES = [
  "Follow simple instructions.",
  "Name school items.",
  "Sort items by use.",
  "Build hand–eye coordination.",
  "Pack a bag independently.",
];
