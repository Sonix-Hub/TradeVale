/* ===== js/bots/thrift_nan.js — Thrift Nan (Thrift Bins) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "thriftNan",
  name: "Thrift Nan",
  role: "Bins Store Keeper",
  x: 2700, y: 420,
  facing: "down",

  palette: {
    skin: "#e6bfa0",
    hair: "#cfcfcf",
    outfit: "#5c7a5c",
    outfitAccent: "#eee2c6",
    pants: "#8a9c7a",
    shoe: "#4a3620",
  },
  hairStyle: "long",
  outfitStyle: "dress",
  accessory: "glasses",

  greeting: "Dig through the bins, dear — two dollars, no exceptions.",
  dialogue: [
    "Dig through the bins, dear — two dollars, no exceptions.",
    "One person's cast-off is another's whole outfit.",
    "I refill the bins every morning before sunrise.",
    "Careful, the racks in the back sometimes hide the good stuff.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
