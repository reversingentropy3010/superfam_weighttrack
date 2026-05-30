'use strict';

// ── Scoring constants ────────────────────────────────────────────────
var SC = {
  LOSS_PCT_PTS:      100,   // 1 pt per 1% of Phase 1 goal completed
  MAINTAIN_BASE:      30,   // pts per month at/below goal (Phase 2)
  GOAL_BASE:          50,   // one-time goal-hit base bonus
  GOAL_EARLY_MAX:     50,   // extra pts for hitting goal early
  STREAK_MILESTONES: [[3, 25], [6, 60], [12, 120]],  // Phase 2 hold streak bonuses
  MONTHLY_RANKS: [20, 10, 5], // pts for 1st / 2nd / 3rd in Phase 1 each month
};

// ── Race sprite sheet config ─────────────────────────────────────────
// animals.png: 3 cols (fat/medium/lean) × 3 rows (chicken/horse/dragon)
// Element size 200×160px, background-size 300% 300%, transform: scaleX(-1)
var RACERS = {
  SC:  { row: 0 },  // chicken
  JC:  { row: 1 },  // horse
  CHC: { row: 2 },  // dragon
};

// animals_finished.png: 1536×1024 — chicken top-left, horse top-right, dragon bottom
// Scale = 160/512 = 0.3125 → rendered size 480×320px (background-size: 480px 320px)
// Chicken (row 0): top-left  → 0px 0px
// Horse   (row 1): top-right → x=768*0.3125=240px → -240px 0px
// Dragon  (row 2): bottom, full-width → y=512*0.3125=160px, centred → -140px -160px
// Separate finished-animal images (one per animal, row-indexed)
var FINISHED_IMGS = [
  'animals_finished_chicken.png',  // row 0
  'animals_finished_horse.png',    // row 1
  'animals_finished_dragon.png',   // row 2
];

// Per-animal quotes: 4 stages (0–33% / 33–66% / 66–100% / at goal)
var ANIMAL_QUOTES = [
  // Chicken (SC, row 0)
  [
    'If I don\'t lose weight soon, I\'m getting turned into Korean fried chicken\u2026',
    'Why did the chicken cross the road? It saw the buffet on the other side.',
    'Look at me, this is poultry in motion',
    'Lean, full of protein, and no longer on any menu screen.',
  ],
  // Horse (JC, row 1)
  [
    'Run? Even standing still feels like a workout.',
    'Running is possible, but only in spirit.',
    'With great horse power comes great responsibility.',
    'I don\'t follow the herd. I set the pace.',
  ],
  // Dragon (CHC, row 2)
  [
    'I can\'t fly, I failed the negotiation with gravity',
    'Even my wings need a nap after flapping.',
    'Still dangerous.. just more aerodynamic',
    'Legends don\'t grow weaker. They refine.',
  ],
];
