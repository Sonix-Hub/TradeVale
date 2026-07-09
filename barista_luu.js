/* ===== js/bots/barista_luu.js — Barista Luu (Corner Cafe) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "baristaLuu",
  name: "Barista Luu",
  role: "Cafe Owner",
  x: 3330, y: 260,
  facing: "down",

  palette: {
    skin: "#e6bfa0",
    hair: "#2c1c14",
    outfit: "#7a5a3a",
    outfitAccent: "#eee2c6",
    pants: "#3d2a1c",
    shoe: "#241812",
  },
  hairStyle: "bun",
  outfitStyle: "apron",
  accessory: "earring",

  greeting: "Sit, stay a while — the tables outside are first-come.",
  dialogue: [
    "Sit, stay a while — the tables outside are first-come.",
    "Traders come here to cool off after the bid battles.",
    "I trade coffee for stories. Best deal in TradeVale.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
