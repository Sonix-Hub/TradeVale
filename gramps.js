/* ===== js/bots/gramps.js — Gramps (Backyard Sale) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "gramps",
  name: "Gramps",
  role: "Backyard Sale Host",
  x: 3900, y: 430,
  facing: "down",

  palette: {
    skin: "#d9a978",
    hair: "#e8e8e8",
    outfit: "#4a6a8a",
    outfitAccent: "#e8c27a",
    pants: "#6a5a3a",
    shoe: "#3a2a1c",
  },
  hairStyle: "bald",
  outfitStyle: "overalls",
  accessory: "none",

  greeting: "Take a look, take a look — clearing out the garage today!",
  dialogue: [
    "Take a look, take a look — clearing out the garage today!",
    "That lemonade stand isn't mine, but the lemonade's good.",
    "Fifty years of collecting, one folding table at a time.",
    "Prices are basically a suggestion around here.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
