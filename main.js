/* ===================== TradeVale — main.js =====================
   2.5D side-scroller engine. Camera scrolls only on X. The player's
   Y position moves between STREET.laneFarY and STREET.laneNearY —
   that's "crossing the road" — and also drives a depth scale so the
   far side reads as background and the near side as foreground.
   ================================================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = STREET.screenW;
canvas.height = STREET.screenH;

const viewport = document.getElementById("viewport");
const zoneLabelEl = document.getElementById("zoneLabel");
const dialogueBox = document.getElementById("dialogueBox");
const speechBubble = document.getElementById("speechBubble");
const zoneToast = document.getElementById("zoneToast");
const lockedToast = document.getElementById("lockedToast");
const interactBtn = document.getElementById("interactBtn");
const minimapEl = document.getElementById("minimap");

/* ---------------- fit canvas letterboxed into viewport, no distortion ---------------- */
function resizeCanvas() {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const targetRatio = STREET.screenW / STREET.screenH;
  let w = vw, h = vw / targetRatio;
  if (h > vh) { h = vh; w = vh * targetRatio; }
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas._cssScale = w / STREET.screenW;
  canvas._offsetX = (vw - w) / 2;
  canvas._offsetY = (vh - h) / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ---------------- bot lookup ---------------- */
const botById = {};
(window.TVBots || []).forEach((b) => (botById[b.id] = b));

const SOLID_TYPES = new Set([
  "fountain", "stall", "building", "house", "counter", "shelf", "rack",
  "bin", "podium", "bidboard", "crate", "standlemonade", "gate", "table",
  "bench", "fence",
]);
const solids = STREET.props.filter((p) => SOLID_TYPES.has(p.type) && p.w && p.h && p.solid !== false);

/* ---------------- depth helpers ---------------- */
// t=0 at the far lane (background, small), t=1 at the near lane (foreground, big)
function laneT(y) {
  return Math.min(1, Math.max(0, (y - STREET.laneFarY) / (STREET.laneNearY - STREET.laneFarY)));
}
function depthScale(y) {
  return 0.82 + laneT(y) * 0.55;
}

/* ---------------- game state ---------------- */
const state = {
  player: {
    x: STREET.startX,
    y: STREET.startY,
    facing: "down",
    moving: false,
    speed: 210,
  },
  cameraX: 0,
  visitedDistricts: new Set([tvDistrictAt(STREET.startX).name]),
  lastTime: performance.now(),
  activeBotId: null,
  dialogueCursor: {},
  bubbleTimer: 0,
};
state.cameraX = clampCamera(state.player.x - STREET.screenW / 2);

function clampCamera(x) {
  return Math.min(Math.max(0, x), Math.max(0, STREET.length - STREET.screenW));
}

const PLAYER_PALETTE = {
  skin: "#e6bfa0",
  hair: "#3d2a1c",
  outfit: "#4a6a8a",
  outfitAccent: "#eee2c6",
  pants: "#2c3a4a",
  shoe: "#241812",
};

/* ---------------- minimap (horizontal street-progress bar) ---------------- */
let mmPlayerEl, mmDistrictEls = [];
function buildMinimap() {
  minimapEl.innerHTML = "";
  const track = document.createElement("div");
  track.id = "minimapTrack";
  const road = document.createElement("div");
  road.className = "mmRoad";
  track.appendChild(road);

  const lockedPct = (STREET.lockedAtX / STREET.length) * 100;
  const lockedBar = document.createElement("div");
  lockedBar.className = "mmLocked";
  lockedBar.style.left = lockedPct + "%";
  lockedBar.style.right = "0";
  track.appendChild(lockedBar);

  STREET.districts.forEach((d) => {
    const midX = (d.from + d.to) / 2;
    const el = document.createElement("div");
    el.className = "mmDistrict";
    el.style.left = (midX / STREET.length) * 100 + "%";
    el.textContent = d.icon;
    el.title = d.name;
    track.appendChild(el);
    mmDistrictEls.push({ el, name: d.name });
  });

  mmPlayerEl = document.createElement("div");
  mmPlayerEl.className = "mmPlayer";
  track.appendChild(mmPlayerEl);

  minimapEl.appendChild(track);
  refreshMinimap();
}
function refreshMinimap() {
  mmPlayerEl.style.left = (state.player.x / STREET.length) * 100 + "%";
  mmDistrictEls.forEach((d) => d.el.classList.toggle("visited", state.visitedDistricts.has(d.name)));
}
buildMinimap();

/* ---------------- toasts ---------------- */
let toastTimer = null;
function showZoneToast(text) {
  zoneToast.textContent = text;
  zoneToast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => zoneToast.classList.remove("show"), 1600);
}
let lockedTimer = null;
function showLockedToast(text) {
  lockedToast.textContent = text;
  lockedToast.classList.add("show");
  clearTimeout(lockedTimer);
  lockedTimer = setTimeout(() => lockedToast.classList.remove("show"), 1800);
}

let currentDistrictName = tvDistrictAt(STREET.startX).name;
function updateDistrictLabel() {
  const d = tvDistrictAt(state.player.x);
  zoneLabelEl.innerHTML = d.icon + ' <span>' + d.name + "</span>";
  if (d.name !== currentDistrictName) {
    currentDistrictName = d.name;
    if (!state.visitedDistricts.has(d.name)) showZoneToast("Entered " + d.name);
    state.visitedDistricts.add(d.name);
  }
}
updateDistrictLabel();

/* ---------------- dialogue ---------------- */
function clearActiveDialogue() {
  state.activeBotId = null;
  dialogueBox.classList.add("empty");
  dialogueBox.textContent = "Walk up to someone and tap the talk button.";
  speechBubble.style.display = "none";
  interactBtn.classList.remove("pulse");
}
clearActiveDialogue();

function findNearbyBot() {
  let nearest = null, nearestDist = 90;
  STREET.bots.forEach((id) => {
    const bot = botById[id];
    if (!bot) return;
    const d = Math.hypot(bot.x - state.player.x, bot.y - state.player.y);
    if (d < nearestDist) { nearestDist = d; nearest = bot; }
  });
  return nearest;
}

function talkTo(bot) {
  const idx = state.dialogueCursor[bot.id] || 0;
  const line = bot.dialogue[idx % bot.dialogue.length];
  state.dialogueCursor[bot.id] = idx + 1;
  dialogueBox.classList.remove("empty");
  dialogueBox.innerHTML = '<span class="who">' + bot.name + " — " + bot.role + '</span>' + line;
  state.activeBotId = bot.id;
  state.bubbleTimer = 2.4;
  positionBubble(bot, line);
}

function positionBubble(bot, line) {
  const scale = canvas._cssScale || 1;
  const screenX = bot.x - state.cameraX;
  const left = canvas._offsetX + screenX * scale;
  const top = canvas._offsetY + (bot.y - 70 * depthScale(bot.y)) * scale;
  speechBubble.style.left = left + "px";
  speechBubble.style.top = top + "px";
  speechBubble.textContent = line.length > 60 ? line.slice(0, 57) + "..." : line;
  speechBubble.style.display = "block";
}

/* ---------------- ambient dust (screen space, unaffected by camera) ---------------- */
const particles = Array.from({ length: 22 }, () => ({
  x: Math.random() * STREET.screenW,
  y: Math.random() * STREET.screenH,
  vx: (Math.random() - 0.5) * 6,
  vy: -6 - Math.random() * 8,
  size: 1 + Math.random() * 1.6,
  alpha: 0.12 + Math.random() * 0.22,
}));

/* ---------------- prop drawing (p.x/p.y are already screen-space here) ---------------- */
function drawProp(p) {
  ctx.save();
  switch (p.type) {
    case "fountain": {
      ctx.fillStyle = "#8f8f8f";
      ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6fa8c9";
      ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2 - 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d9d9d9";
      ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "stall": {
      ctx.fillStyle = "#7a4a2f";
      ctx.fillRect(p.x, p.y + 18, p.w, p.h - 18);
      for (let i = 0; i < p.w; i += 20) {
        ctx.fillStyle = i % 40 === 0 ? "#c1502e" : "#eee2c6";
        ctx.fillRect(p.x + i, p.y, 20, 18);
      }
      ctx.fillStyle = "#241812";
      ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText(p.sign || "", p.x + p.w / 2, p.y + p.h - 12);
      break;
    }
    case "banner": {
      ctx.fillStyle = "#c1502e";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#eee2c6";
      ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      ctx.fillText("~ TRADEVALE ~", p.x + p.w / 2, p.y + p.h - 5);
      break;
    }
    case "crate": {
      ctx.fillStyle = "#8a5a2f";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#5c3a1c"; ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.moveTo(p.x + p.w, p.y); ctx.lineTo(p.x, p.y + p.h); ctx.stroke();
      break;
    }
    case "lamp": {
      ctx.fillStyle = "#241812";
      ctx.fillRect(p.x - 2, p.y - 40, 4, 40);
      ctx.fillStyle = "rgba(217,164,65,0.25)";
      ctx.beginPath(); ctx.arc(p.x, p.y - 44, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f0c876";
      ctx.beginPath(); ctx.arc(p.x, p.y - 44, 6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "river": {
      ctx.fillStyle = "#6fa0c9";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const yy = p.y + 10 + i * (p.h - 20) / 4;
        ctx.beginPath(); ctx.moveTo(p.x, yy); ctx.lineTo(p.x + p.w, yy + 5); ctx.stroke();
      }
      break;
    }
    case "bridge": {
      ctx.fillStyle = "#8a5a2f";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#5c3a1c"; ctx.lineWidth = 2;
      for (let i = 0; i < p.w; i += 16) { ctx.beginPath(); ctx.moveTo(p.x + i, p.y); ctx.lineTo(p.x + i, p.y + p.h); ctx.stroke(); }
      ctx.fillStyle = "#3d2a1c";
      ctx.fillRect(p.x, p.y - 6, p.w, 6);
      ctx.fillRect(p.x, p.y + p.h, p.w, 6);
      break;
    }
    case "signpost": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, 6, 40);
      ctx.fillStyle = "#eee2c6"; ctx.fillRect(p.x - 30, p.y - 6, 66, 20);
      ctx.fillStyle = "#241812"; ctx.font = "9px monospace"; ctx.textAlign = "center";
      ctx.fillText(p.label || "", p.x + 3, p.y + 8);
      break;
    }
    case "reed": {
      ctx.strokeStyle = "#6a8f5c"; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(p.x + i * 6, p.y + 30); ctx.lineTo(p.x + i * 10, p.y); ctx.stroke();
      }
      break;
    }
    case "building": {
      ctx.fillStyle = p.indoor ? "#3a2c22" : "#9c7a52";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      if (!p.indoor) {
        ctx.fillStyle = "#5c3a1c";
        ctx.beginPath();
        ctx.moveTo(p.x - 10, p.y); ctx.lineTo(p.x + p.w / 2, p.y - 50); ctx.lineTo(p.x + p.w + 10, p.y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#eee2c6"; ctx.font = "bold 15px monospace"; ctx.textAlign = "center";
        ctx.fillText(p.sign || "", p.x + p.w / 2, p.y + 40);
        ctx.fillStyle = "#6fa8c9";
        ctx.fillRect(p.x + 20, p.y + 70, 46, 46);
        ctx.fillRect(p.x + p.w - 66, p.y + 70, 46, 46);
      } else {
        ctx.fillStyle = "#241812";
        ctx.fillRect(p.x, p.y, p.w, 10);
      }
      break;
    }
    case "house": {
      ctx.fillStyle = "#c9a86a";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#8a4a2f";
      ctx.beginPath();
      ctx.moveTo(p.x - 16, p.y); ctx.lineTo(p.x + p.w / 2, p.y - 60); ctx.lineTo(p.x + p.w + 16, p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5c3a1c";
      ctx.fillRect(p.x + p.w / 2 - 18, p.y + p.h - 50, 36, 50);
      ctx.fillStyle = "#6fa8c9";
      ctx.fillRect(p.x + 24, p.y + 30, 38, 38);
      ctx.fillRect(p.x + p.w - 62, p.y + 30, 38, 38);
      break;
    }
    case "counter": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#8a5a2f"; ctx.fillRect(p.x, p.y, p.w, 8);
      break;
    }
    case "shelf": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#d9a441";
      for (let i = 0; i < p.h; i += 24) ctx.fillRect(p.x - 6, p.y + i, p.w + 12, 4);
      break;
    }
    case "rack": {
      ctx.fillStyle = "#8a5a2f"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#c1502e"; ctx.fillRect(p.x - 12, p.y, p.w + 24, 6);
      break;
    }
    case "bin": {
      ctx.fillStyle = "#5c7a5c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#3d5a3d"; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y, p.w, p.h);
      ["#c1502e", "#d9a441", "#6fa8c9", "#eee2c6"].forEach((c, i) => {
        ctx.fillStyle = c; ctx.fillRect(p.x + 8 + i * 18, p.y + 6, 10, 10);
      });
      break;
    }
    case "podium": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#d9a441"; ctx.fillRect(p.x, p.y, p.w, 8);
      break;
    }
    case "bidboard": {
      ctx.fillStyle = "#241812"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#d9a441"; ctx.lineWidth = 3; ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#c1502e"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText("CURRENT BID", p.x + p.w / 2, p.y + 22);
      ctx.fillStyle = "#eee2c6"; ctx.font = "bold 20px monospace";
      ctx.fillText("47", p.x + p.w / 2, p.y + 56);
      break;
    }
    case "bench": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      break;
    }
    case "table": {
      ctx.fillStyle = "#8a5a2f";
      ctx.fillRect(p.x - 20, p.y - 12, 40, 24);
      ctx.fillStyle = "#c1502e";
      ctx.beginPath(); ctx.arc(p.x, p.y - 12, 22, Math.PI, 0); ctx.fill();
      break;
    }
    case "awning": {
      for (let i = 0; i < p.w; i += 24) { ctx.fillStyle = (i / 24) % 2 ? "#eee2c6" : "#c1502e"; ctx.fillRect(p.x + i, p.y, 24, p.h); }
      break;
    }
    case "planter": {
      ctx.fillStyle = "#5c3a1c"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#6a8f5c";
      for (let i = 6; i < p.w; i += 16) { ctx.beginPath(); ctx.arc(p.x + i, p.y, 8, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case "standlemonade": {
      ctx.fillStyle = "#eee2c6"; ctx.fillRect(p.x, p.y + 20, p.w, p.h - 20);
      ctx.fillStyle = "#c1502e"; ctx.fillRect(p.x - 6, p.y, p.w + 12, 20);
      ctx.fillStyle = "#241812"; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("LEMONADE", p.x + p.w / 2, p.y + 14);
      break;
    }
    case "fence": {
      ctx.fillStyle = "#8a5a2f";
      for (let i = 0; i < p.w; i += 18) ctx.fillRect(p.x + i, p.y - 10, 6, p.h + 10);
      ctx.fillRect(p.x, p.y, p.w, 6);
      break;
    }
    case "gate": {
      ctx.fillStyle = "#3a3a3a"; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 4;
      for (let i = 0; i < p.w; i += 20) { ctx.beginPath(); ctx.moveTo(p.x + i, p.y); ctx.lineTo(p.x + i, p.y + p.h); ctx.stroke(); }
      ctx.fillStyle = "#c1502e"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      ctx.fillText("LOCKED", p.x + p.w / 2, p.y + p.h / 2);
      break;
    }
  }
  ctx.restore();
}

/* ---------------- update ---------------- */
function update(dt) {
  const input = window.TVInput;
  let dx = input.dx, dy = input.dy;
  const mag = Math.hypot(dx, dy);
  if (mag > 1) { dx /= mag; dy /= mag; }

  state.player.moving = mag > 0.08;
  if (state.player.moving) {
    if (Math.abs(dx) > 0.15) state.player.facing = dx > 0 ? "right" : "left";

    const nx = state.player.x + dx * state.player.speed * dt;
    const ny = state.player.y + dy * state.player.speed * dt * 0.75; // crossing the road is a touch slower

    const bodyR = 10;
    const clampedNy = Math.min(STREET.laneNearY + 10, Math.max(STREET.laneFarY - 10, ny));
    const hitsX = solids.some((s) => nx + bodyR > s.x && nx - bodyR < s.x + s.w && state.player.y + bodyR > s.y && state.player.y - bodyR < s.y + s.h);
    const hitsY = solids.some((s) => state.player.x + bodyR > s.x && state.player.x - bodyR < s.x + s.w && clampedNy + bodyR > s.y && clampedNy - bodyR < s.y + s.h);

    if (!hitsX) {
      const proposedX = Math.min(STREET.lockedAtX - 20, Math.max(20, nx));
      state.player.x = proposedX;
      if (dx > 0 && proposedX >= STREET.lockedAtX - 21) {
        showLockedToast(STREET.lockedMsg);
      }
    }
    if (!hitsY) state.player.y = clampedNy;
  }

  state.cameraX += (clampCamera(state.player.x - STREET.screenW / 2) - state.cameraX) * Math.min(1, dt * 6);

  updateDistrictLabel();
  refreshMinimap();

  particles.forEach((pt) => {
    pt.x += pt.vx * dt; pt.y += pt.vy * dt;
    if (pt.y < -10) { pt.y = STREET.screenH + 10; pt.x = Math.random() * STREET.screenW; }
    if (pt.x < -10) pt.x = STREET.screenW + 10;
    if (pt.x > STREET.screenW + 10) pt.x = -10;
  });

  const nearBot = findNearbyBot();
  interactBtn.classList.toggle("pulse", !!nearBot);
  if (input.interactPressed) {
    input.interactPressed = false;
    if (nearBot) talkTo(nearBot);
  }
  if (state.bubbleTimer > 0) {
    state.bubbleTimer -= dt;
    if (state.bubbleTimer <= 0) speechBubble.style.display = "none";
  }
}

/* ---------------- render ---------------- */
function render() {
  const camX = state.cameraX;
  const sky = tvSkyAt(state.player.x);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STREET.screenW, STREET.screenH);

  // distant parallax skyline (pure atmosphere, scrolls slower than the world)
  const parX = camX * 0.35;
  ctx.fillStyle = "rgba(36,24,18,0.14)";
  for (let i = -1; i < 14; i++) {
    const bx = i * 160 - (parX % 160);
    const bh = 60 + ((i * 37) % 70);
    ctx.fillRect(bx, STREET.laneFarY - bh + 40, 90, bh);
  }

  // sidewalks + road band (screen space, fixed vertically)
  ctx.fillStyle = "#cbb98f";
  ctx.fillRect(0, STREET.laneFarY - 70, STREET.screenW, 60); // far sidewalk
  ctx.fillStyle = "#7a746c";
  ctx.fillRect(0, STREET.laneFarY - 10, STREET.screenW, STREET.laneNearY - STREET.laneFarY + 20); // road
  ctx.fillStyle = "#cbb98f";
  ctx.fillRect(0, STREET.laneNearY + 10, STREET.screenW, STREET.screenH - (STREET.laneNearY + 10)); // near sidewalk

  // dashed lane line, scrolls with camera for motion feedback
  ctx.strokeStyle = "#e8d9b0";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 16]);
  ctx.lineDashOffset = -camX;
  ctx.beginPath();
  const midY = (STREET.laneFarY + STREET.laneNearY) / 2 + 5;
  ctx.moveTo(0, midY); ctx.lineTo(STREET.screenW, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // gather everything visible: props (screen-space copies) + bots + player
  const drawables = [];
  STREET.props.forEach((p) => {
    const sx = p.x - camX;
    if (sx + (p.w || 40) < -60 || sx - (p.w || 40) > STREET.screenW + 60) return; // cull off-screen
    drawables.push({ kind: "prop", sortY: p.y + (p.h || 0), data: Object.assign({}, p, { x: sx }) });
  });
  STREET.bots.forEach((id) => {
    const bot = botById[id];
    if (!bot) return;
    const sx = bot.x - camX;
    if (sx < -80 || sx > STREET.screenW + 80) return;
    drawables.push({ kind: "bot", sortY: bot.y, data: bot, sx });
  });
  drawables.push({ kind: "player", sortY: state.player.y, data: null });
  drawables.sort((a, b) => a.sortY - b.sortY);

  const t = performance.now() / 1000;
  drawables.forEach((d) => {
    if (d.kind === "prop") {
      drawProp(d.data);
    } else if (d.kind === "bot") {
      const bot = d.data;
      const bob = t * 2.4 + bot.id.length * 0.7;
      bot.draw(ctx, d.sx, bot.y, bob, depthScale(bot.y));
      const dist = Math.hypot(bot.x - state.player.x, bot.y - state.player.y);
      if (dist < 100) TVDrawNameTag(ctx, d.sx, bot.y - 46 * depthScale(bot.y), bot.name);
    } else {
      TVDrawHuman(ctx, {
        x: state.player.x - camX, y: state.player.y,
        facing: state.player.facing,
        bob: state.player.moving ? t * 10 : 0,
        palette: PLAYER_PALETTE,
        hairStyle: "short",
        outfitStyle: "vest",
        accessory: "none",
        scale: 3 * depthScale(state.player.y),
      });
    }
  });

  particles.forEach((pt) => {
    ctx.fillStyle = "rgba(255,250,230," + pt.alpha + ")";
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
  });

  const grad = ctx.createRadialGradient(STREET.screenW / 2, STREET.screenH / 2, STREET.screenH * 0.35, STREET.screenW / 2, STREET.screenH / 2, STREET.screenH * 0.9);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STREET.screenW, STREET.screenH);

  if (state.activeBotId) {
    const bot = botById[state.activeBotId];
    if (bot) positionBubble(bot, speechBubble.textContent);
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - state.lastTime) / 1000);
  state.lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
