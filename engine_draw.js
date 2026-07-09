/* ===================== TradeVale — engine_draw.js =====================
   TVDrawHuman(ctx, spec) draws one small pixel-art person.
   Every bot file (js/bots/*.js) and the player just describe WHAT
   they look like (palette + style + a couple of accessories) and
   hand that description to this one function. This is the only
   place actual pixel rectangles get drawn, so every character in
   the game stays visually consistent.

   spec = {
     x, y,            // feet-center position in world/zone pixels
     facing,          // "down" | "up" | "left" | "right"
     bob,             // 0..1 walk-bob phase (engine passes Date-based sine)
     palette: {
       skin, hair, outfit, outfitAccent, pants, shoe
     },
     hairStyle,        // "short" | "bald" | "bun" | "cap" | "long"
     outfitStyle,      // "apron" | "vest" | "dress" | "jacket" | "overalls" | "coat"
     accessory,        // "glasses" | "none" | "earring"
     hatColor,         // optional, used when hairStyle === "cap"
     scale             // pixel scale, default 3
   }
   ======================================================================= */

function TVDrawHuman(ctx, spec) {
  const s = spec.scale || 3;               // size of one "pixel"
  const bobOffset = Math.round(Math.sin(spec.bob || 0) * 1) * s * 0.5;
  const px = (n) => Math.round(n) * s;
  const cx = spec.x;
  const cy = spec.y + bobOffset;
  const p = spec.palette;

  ctx.save();
  ctx.translate(cx, cy);

  // soft ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 2, px(5), px(1.6), 0, 0, Math.PI * 2);
  ctx.fill();

  // legs / pants
  ctx.fillStyle = p.pants;
  ctx.fillRect(-px(3), -px(6), px(2.4), px(6));
  ctx.fillRect(px(0.6), -px(6), px(2.4), px(6));

  // shoes
  ctx.fillStyle = p.shoe || "#3a2a1c";
  ctx.fillRect(-px(3), -px(1), px(2.4), px(1.2));
  ctx.fillRect(px(0.6), -px(1), px(2.4), px(1.2));

  // torso / outfit
  ctx.fillStyle = p.outfit;
  ctx.fillRect(-px(3.4), -px(13), px(6.8), px(7.5));

  // outfit style accents
  if (spec.outfitStyle === "apron") {
    ctx.fillStyle = p.outfitAccent;
    ctx.fillRect(-px(2.6), -px(11.5), px(5.2), px(6));
    ctx.fillStyle = p.outfit;
    ctx.fillRect(-px(0.6), -px(13), px(1.2), px(2));
  } else if (spec.outfitStyle === "vest") {
    ctx.fillStyle = p.outfitAccent;
    ctx.fillRect(-px(3.4), -px(13), px(1.6), px(7.5));
    ctx.fillRect(px(1.8), -px(13), px(1.6), px(7.5));
  } else if (spec.outfitStyle === "overalls") {
    ctx.fillStyle = p.outfitAccent;
    ctx.fillRect(-px(2.4), -px(13), px(1.2), px(3));
    ctx.fillRect(px(1.2), -px(13), px(1.2), px(3));
    ctx.fillRect(-px(3), -px(9), px(6), px(3.5));
  } else if (spec.outfitStyle === "dress") {
    ctx.fillStyle = p.outfit;
    ctx.fillRect(-px(4), -px(9), px(8), px(4));
  } else if (spec.outfitStyle === "coat" || spec.outfitStyle === "jacket") {
    ctx.fillStyle = p.outfitAccent;
    ctx.fillRect(-px(3.4), -px(13), px(1), px(7.5));
    ctx.fillRect(px(2.4), -px(13), px(1), px(7.5));
  }

  // arms
  ctx.fillStyle = p.outfit;
  const armSwing = Math.sin(spec.bob || 0) * s;
  ctx.fillRect(-px(4.6), -px(12) + armSwing, px(1.4), px(5.5));
  ctx.fillRect(px(3.2), -px(12) - armSwing, px(1.4), px(5.5));
  ctx.fillStyle = p.skin;
  ctx.fillRect(-px(4.6), -px(7) + armSwing, px(1.4), px(1.4));
  ctx.fillRect(px(3.2), -px(7) - armSwing, px(1.4), px(1.4));

  // neck + head
  ctx.fillStyle = p.skin;
  ctx.fillRect(-px(1), -px(14), px(2), px(1.4));
  ctx.fillRect(-px(3.2), -px(20), px(6.4), px(6.5));

  // hair
  ctx.fillStyle = p.hair;
  if (spec.hairStyle === "short") {
    ctx.fillRect(-px(3.4), -px(20.5), px(6.8), px(2.4));
  } else if (spec.hairStyle === "bun") {
    ctx.fillRect(-px(3.4), -px(20.5), px(6.8), px(2));
    ctx.fillRect(-px(1), -px(22), px(2), px(1.6));
  } else if (spec.hairStyle === "long") {
    ctx.fillRect(-px(3.6), -px(20.5), px(7.2), px(2.4));
    ctx.fillRect(-px(3.6), -px(18), px(1.4), px(5));
    ctx.fillRect(px(2.2), -px(18), px(1.4), px(5));
  } else if (spec.hairStyle === "cap") {
    ctx.fillStyle = spec.hatColor || p.hair;
    ctx.fillRect(-px(3.6), -px(21), px(7.2), px(2.4));
    ctx.fillRect(-px(3.6), -px(19), px(7.6), px(1.2));
  }
  // bald = no hair drawn

  // face (only when facing down/front-ish; simple 2-dot for side/back too)
  ctx.fillStyle = "#241812";
  if (spec.facing === "up") {
    // back of head, no face
  } else if (spec.facing === "left") {
    ctx.fillRect(-px(2.6), -px(17.5), px(1), px(1));
  } else if (spec.facing === "right") {
    ctx.fillRect(px(1.6), -px(17.5), px(1), px(1));
  } else {
    ctx.fillRect(-px(1.8), -px(17.5), px(1), px(1));
    ctx.fillRect(px(0.8), -px(17.5), px(1), px(1));
  }

  if (spec.accessory === "glasses" && spec.facing !== "up") {
    ctx.strokeStyle = "#241812";
    ctx.lineWidth = Math.max(1, s * 0.3);
    ctx.strokeRect(-px(2.4), -px(17.8), px(2), px(1.4));
    ctx.strokeRect(px(0.4), -px(17.8), px(2), px(1.4));
  }

  ctx.restore();
}

/* small reusable "name tag" drawn above a bot when the player is near it */
function TVDrawNameTag(ctx, x, y, text) {
  ctx.save();
  ctx.font = "bold 11px monospace";
  const w = ctx.measureText(text).width + 10;
  ctx.fillStyle = "rgba(36,24,18,0.85)";
  ctx.fillRect(x - w / 2, y - 22, w, 16);
  ctx.fillStyle = "#d9a441";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y - 10);
  ctx.restore();
}
