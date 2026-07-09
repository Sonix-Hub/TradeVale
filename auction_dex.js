/* ===== js/bots/auction_dex.js — Auctioneer Dex (Auction House) ===== */
window.TVBots = window.TVBots || [];

window.TVBots.push({
  id: "auctionDex",
  name: "Auctioneer Dex",
  role: "Auctioneer",
  x: 1460, y: 260,
  facing: "down",

  palette: {
    skin: "#d9a978",
    hair: "#efe3c8",
    outfit: "#1e1e26",
    outfitAccent: "#c1502e",
    pants: "#141418",
    shoe: "#0a0a0d",
  },
  hairStyle: "cap",
  hatColor: "#c1502e",
  outfitStyle: "coat",
  accessory: "none",

  greeting: "Going once — going twice — SOLD! ...oh, hello, bidder.",
  dialogue: [
    "Going once — going twice — SOLD! ...oh, hello, bidder.",
    "Bid battles start the moment two people want the same crate.",
    "I don't play favorites. The highest bid wins, every time.",
    "Rumor is the Pawnbroker sells me her slow stock at a discount.",
  ],

  draw(ctx, screenX, screenY, bobPhase, scale) {
    TVDrawHuman(ctx, {
      x: screenX, y: screenY, facing: this.facing, bob: bobPhase,
      palette: this.palette, hairStyle: this.hairStyle, hatColor: this.hatColor,
      outfitStyle: this.outfitStyle, accessory: this.accessory, scale: (scale || 1) * 3,
    });
  },
});
