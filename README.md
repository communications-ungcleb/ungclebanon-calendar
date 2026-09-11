# UNGCNL 2026 Engagement Calendar

A standalone, static web page for the UN Global Compact Network Lebanon's 2026
Engagement Calendar — Timeline and List views, filterable by scope, event
type, theme and participation. Plain HTML/CSS/JS, no build step, no
dependencies, no framework.

## Project structure

```
index.html          Page markup
css/styles.css       All styling (brand tokens, layout, responsive, dark mode)
js/icons.js          Simple geometric line-icon set (scope + theme + UI icons)
js/data.js           Taxonomy (theme/scope/type/status metadata) + event data
js/app.js            Filtering, rendering, timeline layout, detail panel logic
assets/              Logo files (Global Compact Blue and white versions)
```

## Running it locally

The page is plain static files, so any static file server works. It cannot
simply be double-clicked and opened as a `file://` URL in every browser,
because a couple of browsers block local `fetch`/module behaviour on `file://`
— serving it over `http://localhost` avoids that entirely and is the safest
option.

**Option A — Node (no install needed beyond Node itself):**
```bash
npx serve .
```
Then open the URL it prints (typically `http://localhost:3000`).

**Option B — Python:**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

**Option C — VS Code:** install the "Live Server" extension, right-click
`index.html`, choose "Open with Live Server".

## Hosting it

This is a static site: upload the folder as-is to any static host (Netlify,
Vercel, GitHub Pages, Cloudflare Pages, or a plain web server/S3 bucket).
There is nothing to build or compile.

## Editing the event data

Everything content-related lives in [`js/data.js`](js/data.js). To add,
remove or change an engagement, edit the `UNGCNL_EVENTS` array — the shape of
each entry is documented in the comment at the top of that file. The rest of
the app (filters, timeline, list, detail panel) reads from this array
automatically, so no other file needs to change for day-to-day content
updates.

All 23 entries currently in the file are **clearly labelled sample
placeholder data** (see each entry's "Placeholder entry" description and the
banner on the page itself) — replace them with confirmed 2026 engagements
when ready. Most placeholder registration links are `"#"` (inert, for
demonstration); set `link` to `null` for engagements with no public page yet,
or to a real URL once one exists.

### Filters

- **Theme filter** shows only the four Ten Principles issue areas (Human
  Rights, Labour, Environment, Anti-Corruption) plus All. It filters by
  *issue area*, not exact theme — so a `Decent Work`-themed event still
  matches the "Labour" filter, and a `Climate`-themed event matches
  "Environment". `Other`-themed events only appear under "All". This mapping
  lives in `UNGCNL_THEME_META` in `js/data.js`.
- **Participation filter** options are `Businesses Only`, `Open to all
  Participants`, `Youth Initiative`, `Non-Businesses Only`, `Public` — set
  in `UNGCNL_PARTICIPATION_FILTERS` in `js/data.js`. Each event's
  `participation` field must exactly match one of these strings.

### Theme colour mapping

Events are colour-coded by `theme`, grouped into the four issue areas of the
Ten Principles of the UN Global Compact (plus "Other" for anything that
doesn't map to one of the four):

| Theme value(s) | Issue area | Colour |
|---|---|---|
| `Human Rights` | Human Rights | Purple `#6E417A` |
| `Labour`, `Decent Work` | Labour | Gold `#CCB146` |
| `Environment`, `Climate` | Environment | Green `#297D6D` |
| `Anti-Corruption` | Anti-Corruption | Red (deepened for text contrast) `#D42D38` |
| `Other` | — | Global Compact Blue `#1E3250` |

This mapping lives in `UNGCNL_THEME_META` at the top of `js/data.js` — change
the `color` values there if brand guidance calls for something different (the
deepened red and navy-on-gold text pairing were chosen to meet WCAG AA 4.5:1
contrast against white pill/badge text; re-check contrast if you change them).

## Brand notes

- Colours, typography and writing rules are taken from the 2026 UN Global
  Compact Brand Guidelines you supplied (Global Compact Blue `#1E3250` +
  tones, secondary palette, Archivo/Roboto/Lora typography, British "ou" +
  American "z" spelling, "Programme", "the Ten Principles of the UN Global
  Compact", em/en dashes, Day Month Year dates).
- Flama (the brand's specified heading typeface) is not available on Google
  Fonts, so **Archivo** (weights 600–900) is used as the geometric-sans
  substitute, as agreed. Roboto (body) and Lora (quote accents) are loaded
  from Google Fonts.
- The logo is only ever shown as the white version on a solid Global Compact
  Blue background (header and footer), per the brand guidelines' logo rules.

## Accessibility

- Skip-to-content link, visible focus states throughout, keyboard-operable
  filters/buttons/links.
- The event detail panel is a proper modal dialog: focus moves into it on
  open, Tab/Shift+Tab is trapped inside it, Escape closes it, and focus
  returns to whatever triggered it. The rest of the page is marked `inert`
  while it is open.
- Colour is never the only signal: every theme tag and status badge also
  carries a text label (and theme tags carry an icon), and scope is shown as
  an icon + label rather than a second colour system.
- Supports `prefers-reduced-motion` and both light and dark colour schemes
  (with a manual override toggle in the header, remembered per browser via
  `localStorage`).

## Known limitations / next steps

- The Timeline view lays out events in fixed-width day columns and scrolls
  horizontally per month row on narrow viewports — this was a deliberate
  trade-off for legible pill labels over cramming a whole month into a phone
  width.
- No automated test suite; verification so far has been manual/DOM-level
  (filters, view toggle, timeline spanning/stacking, detail panel focus
  trap, dark mode, mobile layout). Do a visual pass in your own browser
  before sharing this externally.
