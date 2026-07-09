/* ===== js/bots/fisher_dock.js — Fisher Dock (Street Bridge) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "fisherDock",
  name: "Old Dock",
  role: "Bridge Fisherman",
  x: 2180, y: 400,
  facing: "right",

  palette: {
    skin: "#c98f66",
    hair: "#7a7a7a",
    outfit: "#3a5a4a",
    outfitAccent: "#c9a86a",
    pants: "#2a3a2a",
    shoe: "#1a2a1a",
  },
  hairStyle: "cap",
  hatColor: "#5c7a5c",
  outfitStyle: "jacket",
  accessory: "none",

  greeting: "Not much biting today. Good day for a walk to the plaza, though.",
  dialogue: [
    "Not much biting today. Good day for a walk to the plaza, though.",
    "I've seen every trader in TradeVale cross this bridge at least once.",
    "The river carries all sorts of junk. Some of it's worth a look.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle, hatColor: this.hatColor,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
