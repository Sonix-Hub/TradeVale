/* ===================== TradeVale — map.js =====================
   2.5D SIDE-SCROLLER WORLD.
   The camera only ever scrolls horizontally. There is no vertical
   scroll — instead, the player's Y position moves them between the
   FAR side of the road (small, background, near top of the road band)
   and the NEAR side of the road (big, foreground, near bottom of the
   road band). That vertical move is what "crossing the street" is,
   and it also drives a depth-scale so things further away look smaller.

   Everything (buildings, decor, bots) lives at a worldX position along
   one long street. To extend the map, add more entries further down
   the STREET.length — nothing else needs to change.
   ================================================================ */

const STREET = {
  length: 4900,          // total world width, in px
  screenW: 960,
  screenH: 540,

  // vertical band the player can walk within (the "width" of the road)
  laneFarY: 225,          // far/background side of the road
  laneNearY: 460,         // near/foreground side of the road

  startX: 150,
  startY: 430,

  lockedAtX: 4500,        // invisible gate — story content beyond here is "coming soon"
  lockedMsg: "Merchant Alley is still being built — the street ends here for now.",

  // sky changes gently as you walk, cheapest way to make the long
  // street feel like it has real neighbourhoods
  skyStops: [
    { x: 0, color: "#cfe8d8" },
    { x: 1200, color: "#e3d6c2" },
    { x: 2000, color: "#bcdff0" },
    { x: 2900, color: "#e7ddc9" },
    { x: 3700, color: "#f2e2c8" },
    { x: 4500, color: "#cfcabf" },
  ],

  // District labels shown on the left panel + minimap, purely by X range
  districts: [
    { name: "Trading Plaza", icon: "🏛", from: 0, to: 650 },
    { name: "Pawn & Pledge", icon: "💍", from: 650, to: 1250 },
    { name: "Auction House", icon: "🔨", from: 1250, to: 1950 },
    { name: "Street Bridge", icon: "🌉", from: 1950, to: 2500 },
    { name: "Thrift Bins", icon: "🧺", from: 2500, to: 3050 },
    { name: "Corner Cafe", icon: "☕", from: 3050, to: 3650 },
    { name: "Backyard Sale", icon: "🏡", from: 3650, to: 4300 },
    { name: "Merchant Alley (soon)", icon: "🔒", from: 4300, to: 4900 },
  ],

  // bots just reference an id — the actual character lives in js/bots/*.js
  bots: [
    "merchantJoe", "pawnMira", "auctionDex", "fisherDock",
    "thriftNan", "baristaLuu", "gramps",
  ],

  // static world props: buildings, stalls, decor. `side` is "near" or
  // "far" and mainly affects draw order / scale; `solid:false` makes
  // something walk-through (decor only).
  props: [
    // ---------- Trading Plaza ----------
    { type: "banner", x: 40, y: 60, w: 560, h: 20, side: "far" },
    { type: "fountain", x: 260, y: 380, w: 70, h: 70, side: "near" },
    { type: "stall", x: 60, y: 330, w: 120, h: 90, sign: "GOODS", side: "near" },
    { type: "stall", x: 460, y: 330, w: 120, h: 90, sign: "TRADE", side: "near" },
    { type: "lamp", x: 20, y: 460, side: "near" },
    { type: "crate", x: 380, y: 420, w: 26, h: 24, side: "near" },

    // ---------- Pawn & Pledge ----------
    { type: "building", x: 680, y: 90, w: 320, h: 380, sign: "PAWN & PLEDGE", side: "near" },
    { type: "counter", x: 780, y: 400, w: 130, h: 36, side: "near" },
    { type: "lamp", x: 1020, y: 460, side: "near" },
    { type: "signpost", x: 1120, y: 440, label: "AUCTION ->", side: "near" },

    // ---------- Auction House ----------
    { type: "building", x: 1320, y: 60, w: 300, h: 240, indoor: true, sign: "", side: "far" },
    { type: "podium", x: 1420, y: 220, w: 80, h: 60, side: "far" },
    { type: "bidboard", x: 1620, y: 130, w: 150, h: 100, side: "far" },
    { type: "bench", x: 1280, y: 400, w: 120, h: 20, side: "near" },
    { type: "crate", x: 1700, y: 410, w: 26, h: 24, side: "near" },

    // ---------- Street Bridge (river crossing) ----------
    { type: "river", x: 1950, y: 250, w: 550, h: 70, side: "far", solid: false },
    { type: "bridge", x: 2020, y: 400, w: 400, h: 40, side: "near", solid: false },
    { type: "lamp", x: 2000, y: 400, side: "near" },
    { type: "lamp", x: 2380, y: 400, side: "near" },
    { type: "reed", x: 1970, y: 310, side: "far", solid: false },
    { type: "reed", x: 2460, y: 310, side: "far", solid: false },

    // ---------- Thrift Bins ----------
    { type: "building", x: 2560, y: 100, w: 260, h: 370, sign: "BINS $2", side: "near" },
    { type: "bin", x: 2860, y: 380, w: 80, h: 55, side: "near" },
    { type: "bin", x: 2960, y: 400, w: 80, h: 55, side: "near" },
    { type: "rack", x: 3080, y: 300, w: 22, h: 160, side: "near" },

    // ---------- Corner Cafe ----------
    { type: "building", x: 3200, y: 60, w: 280, h: 220, sign: "CAFE", side: "far" },
    { type: "awning", x: 3190, y: 260, w: 300, h: 22, side: "far" },
    { type: "table", x: 3160, y: 420, side: "near" },
    { type: "table", x: 3350, y: 430, side: "near" },
    { type: "planter", x: 3550, y: 450, w: 80, h: 20, side: "near" },

    // ---------- Backyard Sale ----------
    { type: "house", x: 3760, y: 40, w: 340, h: 150, side: "far" },
    { type: "fence", x: 3700, y: 470, w: 500, h: 14, side: "near" },
    { type: "table", x: 3820, y: 420, side: "near" },
    { type: "table", x: 3980, y: 430, side: "near" },
    { type: "standlemonade", x: 4130, y: 400, w: 70, h: 60, side: "near" },

    // ---------- Merchant Alley gate (locked) ----------
    { type: "gate", x: 4460, y: 200, w: 160, h: 260, side: "near" },
  ],
};

/* current district name for a given world X, used by the left panel label */
function tvDistrictAt(x) {
  for (const d of STREET.districts) {
    if (x >= d.from && x < d.to) return d;
  }
  return STREET.districts[STREET.districts.length - 1];
}

/* blended sky color for a given world X (linear fade between stops) */
function tvSkyAt(x) {
  const stops = STREET.skyStops;
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (x >= stops[i].x && x <= stops[i + 1].x) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const span = Math.max(1, b.x - a.x);
  const t = Math.min(1, Math.max(0, (x - a.x) / span));
  return tvLerpColor(a.color, b.color, t);
}
function tvLerpColor(c1, c2, t) {
  const p1 = tvHexToRgb(c1), p2 = tvHexToRgb(c2);
  const r = Math.round(p1.r + (p2.r - p1.r) * t);
  const g = Math.round(p1.g + (p2.g - p1.g) * t);
  const b = Math.round(p1.b + (p2.b - p1.b) * t);
  return "rgb(" + r + "," + g + "," + b + ")";
}
function tvHexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
