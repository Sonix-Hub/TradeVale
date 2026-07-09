# TradeVale

A fully offline, free, 2.5D pixel-art trading game. Landscape only. No
build step, no dependencies — open `index.html` in a browser (or wrap
it in a WebView for an Android APK) and it runs.

Theme: auctions, bid battles, pawn shops, thrift bins, backyard sales,
a trading plaza, a cafe, and a street bridge — all strung along one
long side-scrolling street.

## How it plays
The camera sits at street level and scrolls sideways as you walk, like
Terraria/Hollow Knight. The joystick moves you two ways:
- **left/right** — walk down the street (the camera follows you)
- **up/down** — cross the road between its far side (background,
  smaller) and near side (foreground, bigger) — that's the "2.5D"
  depth: buildings and bots scale depending on which side of the
  street they're on, same as you do.

On desktop: arrow keys / WASD to move, `Space` or `E` to talk.

## How the project is organized

Everything is plain HTML/CSS/JS, split so each piece can be edited or
swapped without touching the others:

```
index.html          <- wires everything together via <script> tags
css/style.css        <- entire look: landscape layout, panel, buttons
js/map.js             <- THE WORLD. One long street: districts, buildings, decor.
js/engine_draw.js    <- shared pixel-art person renderer (used by player + bots)
js/controls.js       <- joystick / d-pad / keyboard input, independent of the engine
js/main.js           <- the engine: camera scroll, lane depth, collision, dialogue, minimap
js/bots/
  _bot_template.js   <- copy this to create a new bot (not loaded by index.html)
  merchant_joe.js    <- Trading Plaza merchant
  pawn_mira.js       <- Pawnbroker at Pawn & Pledge
  auction_dex.js     <- Auctioneer at the Auction House
  thrift_nan.js      <- Keeper of the Thrift Bins
  gramps.js          <- Host of the Backyard Sale
  fisher_dock.js     <- Ambient character on the Street Bridge
  barista_luu.js     <- Owner of the Corner Cafe
```

### Adding a new bot
1. Copy `js/bots/_bot_template.js` to `js/bots/your_bot.js`.
2. Fill in `id`, `name`, an `x` (world position along the street) and
   `y` (between `STREET.laneFarY` ~225 and `STREET.laneNearY` ~460),
   palette, outfit style and `dialogue`.
3. Add `<script src="js/bots/your_bot.js"></script>` to `index.html`,
   above `js/main.js`.
4. Add `"yourBotId"` to `STREET.bots` in `js/map.js`.

The bot instantly appears in the world, walkable-to and talkable —
no changes to the engine needed.

### Expanding the street
`js/map.js` holds one long `STREET` object. To add a new district:
1. Raise `STREET.length` if you're adding past the current end.
2. Add an entry to `STREET.districts` (name, icon, x range) so it
   shows up on the minimap and the left-panel label.
3. Add props (buildings/decor) with a world `x`/`y` and `side`
   (`"near"` or `"far"`) to `STREET.props`.
4. Move `STREET.lockedAtX` further out if you're extending past the
   current "coming soon" gate.

### Current street layout (west to east)
Trading Plaza → Pawn & Pledge → Auction House → Street Bridge →
Thrift Bins → Corner Cafe → Backyard Sale → **Merchant Alley (locked,
coming soon)**.

## Publishing to GitHub / building for Android
- Create a new GitHub repo and add these files directly (drag-and-drop
  on github.com works fine, or `git clone` your empty repo locally,
  copy the files in, and push) — you don't need to keep them zipped.
  GitHub Pages can then serve `index.html` directly for free web play.
- For an Android APK, wrap `index.html` in a WebView shell (e.g. via
  Android Studio's WebView activity, or a tool like Capacitor/Cordova)
  pointed at these local files — the game needs no network access.
