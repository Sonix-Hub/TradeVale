/* =====================================================================
   _bot_template.js — COPY THIS FILE TO MAKE A NEW BOT
   =====================================================================
   1. Duplicate this file as js/bots/yourBotId.js
   2. Change every field below
   3. Add <script src="js/bots/yourBotId.js"></script> to index.html
      (right above <script src="js/main.js">)
   4. Add "yourBotId" to a zone's `bots` array in js/map.js
   That's it — the bot appears in the world, walkable-to and talkable.
   This file itself is NOT loaded by index.html, it's just the guide.
   ===================================================================== */

window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "templateBot",              // must match the id used in map.js
  name: "Template Tessa",         // shown in the name tag + dialogue box
  role: "Example Vendor",         // small subtitle shown in dialogue

  // Where along the street the bot stands: x = world position (0..STREET.length),
  // y = STREET.laneFarY (~225, background/small) .. STREET.laneNearY (~460, foreground/big)
  x: 1000, y: 430,
  facing: "down",                 // default facing when idle

  // ---- characteristics: texture / body / clothes ----
  palette: {
    skin: "#e0b088",
    hair: "#4a2c1c",
    outfit: "#7a8f6a",
    outfitAccent: "#5c6e4f",
    pants: "#3d2a1c",
    shoe: "#241812",
  },
  hairStyle: "short",             // short | bald | bun | long | cap
  outfitStyle: "vest",            // apron | vest | dress | overalls | coat
  accessory: "none",              // glasses | earring | none

  // ---- personality / dialogue ----
  greeting: "Welcome, welcome — everything's for trade!",
  dialogue: [
    "Welcome, welcome — everything's for trade!",
    "I started this stall with a single broken radio.",
    "Come back after you've explored more of TradeVale.",
  ],

  // draw() is called every frame by main.js. It just hands your
  // characteristics to the shared pixel-art renderer.
  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX,
      y: screenY,
      facing: this.facing,
      bob: bobPhase,
      palette: this.palette,
      hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle,
      accessory: this.accessory,
      scale: (scale || 1) * 3,
    });
  },
});
