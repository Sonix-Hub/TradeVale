/* ===== js/bots/pawn_mira.js — Pawnbroker Mira (Pawn & Pledge) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "pawnMira",
  name: "Pawnbroker Mira",
  role: "Pawnbroker",
  x: 830, y: 420,
  facing: "down",

  palette: {
    skin: "#c98f66",
    hair: "#1c1c1c",
    outfit: "#3a3a4a",
    outfitAccent: "#d9a441",
    pants: "#22222c",
    shoe: "#0f0f14",
  },
  hairStyle: "bun",
  outfitStyle: "vest",
  accessory: "glasses",

  greeting: "Pawn it, pledge it, or leave with more than you came in with.",
  dialogue: [
    "Pawn it, pledge it, or leave with more than you came in with.",
    "Everything behind this counter has a previous owner and a good story.",
    "I don't lowball — I just know what things are actually worth.",
    "The auction house buys my overstock. Small world, this trading plaza.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
