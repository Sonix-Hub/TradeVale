/* ===================== TradeVale — controls.js =====================
   Two interchangeable movement schemes live on the LEFT menu panel:
     - a draggable circular joystick (#joystickZone / #joystickKnob)
     - a 4-way arrow d-pad (#dpad button.up/left/right/down)
   Both just update window.TVInput.dx / dy (-1..1 each), which
   main.js reads every animation frame. #controlModeToggle swaps
   which one is visible.
   ======================================================================= */

window.TVInput = {
  dx: 0,
  dy: 0,
  interactPressed: false, // set true for one frame when tapped
};

(function () {
  const zone = document.getElementById("joystickZone");
  const knob = document.getElementById("joystickKnob");
  const dpad = document.getElementById("dpad");
  const toggleBtn = document.getElementById("controlModeToggle");
  const interactBtn = document.getElementById("interactBtn");

  const maxDrag = 28; // px the knob can travel from center
  let dragging = false;
  let originX = 0, originY = 0;

  function setKnob(x, y) {
    knob.style.left = 28 + x + "px";
    knob.style.top = 28 + y + "px";
  }

  function pointerPos(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }

  function dragStart(e) {
    dragging = true;
    const rect = zone.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
    e.preventDefault();
  }

  function dragMove(e) {
    if (!dragging) return;
    const p = pointerPos(e);
    let dx = p.x - originX;
    let dy = p.y - originY;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDrag) {
      dx = (dx / dist) * maxDrag;
      dy = (dy / dist) * maxDrag;
    }
    setKnob(dx, dy);
    window.TVInput.dx = dx / maxDrag;
    window.TVInput.dy = dy / maxDrag;
    e.preventDefault();
  }

  function dragEnd(e) {
    dragging = false;
    setKnob(0, 0);
    window.TVInput.dx = 0;
    window.TVInput.dy = 0;
    if (e) e.preventDefault();
  }

  zone.addEventListener("touchstart", dragStart, { passive: false });
  zone.addEventListener("touchmove", dragMove, { passive: false });
  zone.addEventListener("touchend", dragEnd, { passive: false });
  zone.addEventListener("mousedown", dragStart);
  window.addEventListener("mousemove", dragMove);
  window.addEventListener("mouseup", dragEnd);

  // ---- d-pad buttons (press-and-hold) ----
  const heldDirs = { up: false, down: false, left: false, right: false };
  function recomputeDpad() {
    window.TVInput.dx = (heldDirs.right ? 1 : 0) - (heldDirs.left ? 1 : 0);
    window.TVInput.dy = (heldDirs.down ? 1 : 0) - (heldDirs.up ? 1 : 0);
  }
  dpad.querySelectorAll("button[data-dir]").forEach((btn) => {
    const dir = btn.dataset.dir;
    const press = (e) => { heldDirs[dir] = true; recomputeDpad(); e.preventDefault(); };
    const release = (e) => { heldDirs[dir] = false; recomputeDpad(); if (e) e.preventDefault(); };
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("mouseleave", release);
  });

  // ---- keyboard (handy for desktop testing) ----
  const keyDirs = { up: false, down: false, left: false, right: false };
  function recomputeKeys() {
    window.TVInput.dx = (keyDirs.right ? 1 : 0) - (keyDirs.left ? 1 : 0);
    window.TVInput.dy = (keyDirs.down ? 1 : 0) - (keyDirs.up ? 1 : 0);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w") keyDirs.up = true;
    if (e.key === "ArrowDown" || e.key === "s") keyDirs.down = true;
    if (e.key === "ArrowLeft" || e.key === "a") keyDirs.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keyDirs.right = true;
    if (e.key === " " || e.key === "e") window.TVInput.interactPressed = true;
    recomputeKeys();
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" || e.key === "w") keyDirs.up = false;
    if (e.key === "ArrowDown" || e.key === "s") keyDirs.down = false;
    if (e.key === "ArrowLeft" || e.key === "a") keyDirs.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keyDirs.right = false;
    recomputeKeys();
  });

  // ---- interact button ----
  interactBtn.addEventListener("touchstart", (e) => { window.TVInput.interactPressed = true; e.preventDefault(); }, { passive: false });
  interactBtn.addEventListener("mousedown", () => { window.TVInput.interactPressed = true; });

  // ---- toggle joystick vs d-pad ----
  let mode = "joystick";
  toggleBtn.addEventListener("click", () => {
    mode = mode === "joystick" ? "dpad" : "joystick";
    zone.style.display = mode === "joystick" ? "block" : "none";
    dpad.style.display = mode === "dpad" ? "grid" : "none";
    toggleBtn.textContent = mode === "joystick" ? "Switch to D-Pad" : "Switch to Joystick";
    dragEnd();
    Object.keys(heldDirs).forEach((k) => (heldDirs[k] = false));
  });
})();
