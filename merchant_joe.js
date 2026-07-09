/* ===== js/bots/merchant_joe.js — Merchant Joe (Trading Plaza) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "merchantJoe",
  name: "Merchant Joe",
  role: "General Merchant",
  x: 200, y: 430,
  facing: "down",

  palette: {
    skin: "#e0b088",
    hair: "#5a3a22",
    outfit: "#8a4a2f",
    outfitAccent: "#e8c27a",
    pants: "#3d2a1c",
    shoe: "#241812",
  },
  hairStyle: "short",
  outfitStyle: "apron",
  accessory: "none",

  greeting: "Fresh finds every morning — take a look, take a look!",
  dialogue: [
    "Fresh finds every morning — take a look, take a look!",
    "I trade anything with a story behind it.",
    "Try the Pawn Shop east of here if you want something rarer.",
    "The auction house gets rowdy around closing time. Watch yourself.",
    "Business is slow today. Maybe you'll change that.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
