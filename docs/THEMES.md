# TCS Radio — Theme Packs

Seven switchable skins, plus a **Station Auto** mode that re-tints whichever skin
is active to match the radio playlist you're listening to.

Developed by Umair.

| | Theme | Feel | Mode | Display face | Body face |
| --- | --- | --- | --- | --- | --- |
| 📻 | **Retro Gold** *(default)* | The original 2000s amber, cream & mahogany | dark | Baloo 2 | Inter |
| 🌆 | **Synthwave '84** | Neon magenta + cyan, arcade scanlines, grid glow | dark | Bungee | Chakra Petch |
| 🌧️ | **Monsoon Blue** | Late-night rain cinema, cool indigo, heavy grain | dark | Baloo 2 | Karla |
| 🎞️ | **Old Poster** | Hand-painted 70s Bollywood print, sepia paper tooth | **light** | Yatra One | Source Serif 4 |
| 🟢 | **Phosphor** | Green CRT terminal, hard scanlines, glyph bloom | dark | VT323 | Share Tech Mono |
| 🖤 | **Midnight Noir** | High-contrast black & gold, squared corners | dark | Playfair Display | Barlow |
| ☀️ | **Chai Daylight** | Bright warm day mode for sunny afternoons | **light** | Fraunces | Inter |

Switch with the 🎨 **Theme** pill in the top bar, press <kbd>T</kbd> to cycle,
or deep-link a skin: `https://…/?theme=synthwave`.

---

## How it works

A theme is *one attribute on `<html>`* — nothing else:

```html
<html data-theme="phosphor" data-theme-mode="dark">
```

```
public/css/variables.css      ~215 design tokens + the default (Retro Gold) values
public/css/themes.css         each skin re-maps those tokens, plus texture overlays
public/css/theme-switcher.css the 🎨 pill and the skin-picker panel
public/js/themes.js           registry, persistence, lazy webfonts, Station Auto
```

No component stylesheet knows which theme is running. `.player`, `.sheet`,
`.station-btn`, the drawer, the modals and the sections all read tokens, so a
new skin is a pure data change — there is no per-component theming code to keep
in sync.

### Token layers

| Layer | Examples | Purpose |
| --- | --- | --- |
| Channel triplets | `--accent-rgb: 245, 179, 36` | Raw channels. Everything below derives from these, so **one** value recolours a whole family. |
| Alpha ladders | `--accent-rgb-45`, `--paper-rgb-08` | One step per alpha the original artwork actually used — no quantising, so the default skin is pixel-exact. |
| Ramps | `--text` / `--text-soft` / `--text-dim` / `--text-hi`, `--chip-light` / `--accent` / `--chip-dark` | Foreground and highlight ramps. |
| Surfaces | `--bg`, `--bg-image`, `--panel`, `--well`, `--surface-sunken`, `--field` | Page, glass deck, wells, inputs. |
| Composition | `--hero-shade`, `--brand-shadow`, `--main-grad`, `--sheet-grad` | Multi-stop values a skin can swap wholesale. |
| Shape & type | `--radius*`, `--font-display`, `--font-body` | Noir squares the corners; Phosphor swaps to a terminal face. |
| Texture | `--fx-scanline-*`, `--fx-grain-*`, `--fx-vignette`, `--fx-*-blend` | Scanlines, film grain and vignette on a click-through overlay. |

The original design hand-tuned **three** separate gold ramps (chip, key and
slider-thumb) rather than one, so they are kept as distinct tokens
(`--chip-*`, `--key-*`, `--thumb-dark`) instead of being collapsed — that is what
lets Retro Gold stay byte-for-byte the artwork it shipped as.

### Station Auto

`player.js` already knew each playlist's accent (`PLAYLISTS[key].accent`). On
every station change it now also calls:

```js
Themes.setStationAccent(pl.accent, pl.glow, key);
```

which writes `--accent-rgb` on `:root`. Because the whole accent ladder derives
from that one triplet, the play button, badges, glows, focus ring, scrollbar and
hero wash all follow the station — Office gold → Auto orange → Truck red-orange →
Monsoon blue → Tapri amber → Indipop violet. Turn it off in the picker and the
skin keeps its own accent.

### No flash of wrong theme

`js/themes.js` is loaded in `<head>` and calls `Themes.boot()` immediately, so
the stored skin lands on `<html>` before first paint. Webfonts are fetched
lazily per theme on first use, so the default skin still ships exactly the two
families it always did.

### Accessibility

* The picker is a `role="radiogroup"` with arrow-key navigation, `aria-checked`
  state and `aria-expanded` on the trigger; <kbd>Esc</kbd> closes it.
* `data-theme-mode="light|dark"` is published alongside the theme so form
  controls, scrollbars and `color-scheme` follow.
* `<meta name="theme-color">` is retuned per skin (browser chrome matches).
* Texture overlays are `pointer-events: none`, and all theme animation is
  disabled under `prefers-reduced-motion`.
* Contrast is machine-checked — see below.

---

## Adding a theme

1. Add a block to `public/css/themes.css`:

   ```css
   :root[data-theme="mytheme"] {
     --accent-rgb: 255, 120, 0;
     --paper-rgb: 255, 236, 214;
     --cream-rgb: 255, 246, 235;
     --bg: #140a04;
     --bg-image: linear-gradient(180deg, #221005, #140a04);
     /* …surfaces, ramps, fonts, texture */
   }
   ```

   Start from an existing block and change the values — the audit scripts below
   will tell you if you forgot one.

2. Register it in `THEMES` in `public/js/themes.js` (id, name, emoji, one-line
   description, `mode`, `metaColor`, swatch `channels`, and the Google Fonts
   query — or `fonts: null` if the default faces are right).

That's the whole integration. Nothing else needs to know it exists.

---

## Checks

```bash
npm run check          # all four
npm run check:tokens   # every var(--x) resolves; no self-referential tokens
npm run check:render   # default theme resolves to the ORIGINAL colours (vs git HEAD)
npm run check:contrast # WCAG contrast for all 11 text pairs × 7 themes
npm run check:engine   # jsdom test of boot/switch/persist/cycle/Station Auto
```

`check:render` is the safety net for the tokenisation: it walks all **1145**
declarations in the seven component stylesheets, resolves every token to a
concrete colour through both the *current* and the *pre-refactor* token graphs,
and fails if the default theme drifted. It currently reports zero drift above
perceptual threshold (24 consolidations of ≤12/255, where the original held two
near-identical hexes such as `#120a05` / `#120904` that now share one token).

`check:contrast` enforces a 3:1 legibility floor everywhere and reports which
pairs only reach AA-large. Current state: **77 pairs, 0 failures**, 3 pairs at
3–4.5:1 (bold 13px+ chip inks, which is within AA-large).
