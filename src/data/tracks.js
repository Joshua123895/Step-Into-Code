import pythonIcon from "../assets/icons/python.svg";
import mountainIcon from "../assets/icons/mountain-chapter.svg";
import swordIcon from "../assets/icons/sword-badge.svg";
import trophyIcon from "../assets/icons/trophy-badge.svg";
import shieldIcon from "../assets/icons/shield-badge.svg";
import sparklesIcon from "../assets/icons/sparkles-badge.svg";

export const TRACKS = [
  {
    id: 1,
    name: "Python Fundamentals",
    slug: "python",
    icon: pythonIcon,
    description: "Learn variables, conditions, loops and functions through bite-sized coding puzzles.",
    chapters: [
      {
        id: 1,
        name: "Variables Valley",
        icon: mountainIcon,
        levels: [
          {
            id: 1,
            name: "First Variable",
            objective: [
              { type: "text", value: "Create a variable named " },
              { type: "code", value: "x" },
              { type: "text", value: " and assign the value " },
              { type: "code", value: "10" },
              { type: "text", value: " to it." },
            ],
            hint: [
              { type: "text", value: "In Python, you assign values with " },
              { type: "code", value: "=" },
              { type: "text", value: ". Try: " },
              { type: "code", value: "x = 10" },
              { type: "text", value: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos." }, 
            ],
            startingCode: "x = ",
            solution: "x = 10",
            xp: 50,
            badge: { name: "Variable Apprentice", icon: swordIcon },
          },
          {
            id: 2,
            name: "Treasure Count",
            objective: [
              { type: "text", value: "Create a variable named " },
              { type: "code", value: "treasure" },
              { type: "text", value: " and set it to " },
              { type: "code", value: "5" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Use the same pattern: " },
              { type: "code", value: "treasure = 5" },
            ],
            startingCode: "treasure = ",
            solution: "treasure = 5",
            xp: 50,
            badge: { name: "Treasure Hunter", icon: trophyIcon },
          },
          {
            id: 3,
            name: "Hero HP",
            objective: [
              { type: "text", value: "Store the hero's health points. Create a variable " },
              { type: "code", value: "hp" },
              { type: "text", value: " and assign " },
              { type: "code", value: "100" },
              { type: "text", value: " to it." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "hp = 100" },
            ],
            startingCode: "hp = ",
            solution: "hp = 100",
            xp: 50,
            badge: { name: "HP Guardian", icon: shieldIcon },
          },
          {
            id: 4,
            name: "Magic Points",
            objective: [
              { type: "text", value: "A mage needs mana. Create a variable " },
              { type: "code", value: "mp" },
              { type: "text", value: " set to " },
              { type: "code", value: "50" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Like before: " },
              { type: "code", value: "mp = 50" },
            ],
            startingCode: "mp = ",
            solution: "mp = 50",
            xp: 60,
            badge: { name: "Magic Caster", icon: sparklesIcon },
          },
          {
            id: 5,
            name: "Shop Gold",
            objective: [
              { type: "text", value: "Track the shop's gold. Create " },
              { type: "code", value: "gold" },
              { type: "text", value: " and set it to " },
              { type: "code", value: "250" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "gold = 250" },
            ],
            startingCode: "gold = ",
            solution: "gold = 250",
            xp: 60,
            badge: { name: "Shop Keeper", icon: trophyIcon },
          },
          {
            id: 6,
            name: "Inventory Count",
            objective: [
              { type: "text", value: "Count the items. Create " },
              { type: "code", value: "items" },
              { type: "text", value: " and set it to " },
              { type: "code", value: "12" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "items = 12" },
            ],
            startingCode: "items = ",
            solution: "items = 12",
            xp: 70,
            badge: { name: "Inventory Master", icon: shieldIcon },
          },
          {
            id: 7,
            name: "Village Population",
            objective: [
              { type: "text", value: "Store the village size. Create " },
              { type: "code", value: "villagers" },
              { type: "text", value: " set to " },
              { type: "code", value: "340" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "villagers = 340" },
            ],
            startingCode: "villagers = ",
            solution: "villagers = 340",
            xp: 70,
            badge: { name: "Scribe", icon: swordIcon },
          },
          {
            id: 8,
            name: "Dragon Health",
            objective: [
              { type: "text", value: "A dragon appears! Create " },
              { type: "code", value: "dragon_hp" },
              { type: "text", value: " set to " },
              { type: "code", value: "500" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "dragon_hp = 500" },
            ],
            startingCode: "dragon_hp = ",
            solution: "dragon_hp = 500",
            xp: 80,
            badge: { name: "Dragon Slayer", icon: swordIcon },
          },
          {
            id: 9,
            name: "Castle Coins",
            objective: [
              { type: "text", value: "The royal treasury. Create " },
              { type: "code", value: "coins" },
              { type: "text", value: " set to " },
              { type: "code", value: "9999" },
              { type: "text", value: "." },
            ],
            hint: [
              { type: "text", value: "Try: " },
              { type: "code", value: "coins = 9999" },
            ],
            startingCode: "coins = ",
            solution: "coins = 9999",
            xp: 80,
            badge: { name: "Treasurer", icon: trophyIcon },
          },
          {
            id: 10,
            name: "Final Exercise",
            objective: [
              { type: "text", value: "Create a variable " },
              { type: "code", value: "answer" },
              { type: "text", value: " and set it to " },
              { type: "code", value: "42" },
              { type: "text", value: " — the meaning of everything." },
            ],
            hint: [
              { type: "text", value: "You know the drill: " },
              { type: "code", value: "answer = 42" },
            ],
            startingCode: "answer = ",
            solution: "answer = 42",
            xp: 100,
            badge: { name: "Code Master", icon: sparklesIcon },
          },
        ],
        challenges: [
          { id: 1, name: "Treasure Keeper", xp: 100 },
          { id: 2, name: "Variable Master", xp: 150 },
        ],
      },
    ],
  },
];
