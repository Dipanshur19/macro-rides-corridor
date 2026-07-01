# Macro Rides — Dispatch Console

A production-grade dispatch operations dashboard for hyperlocal EV mobility. Given a driver's live route across **Delhi NCR**, it builds a **350 m buffer corridor**, indexes that corridor with **H3** (Uber's hexagonal spatial index), and highlights every **eligible pickup point** inside it — updating live as the driver moves. Includes a real **3D extruded-hexagon** view powered by deck.gl.

Built to look and behave like an internal ops tool used by a ride-hailing/EV-mobility company.

---

## Features

- **Live route simulation** — animated driver with play / pause / reset, scrubbing, adjustable speed, and 1x / 2x / 5x playback.
- **350 m corridor** — generated with Turf.js; dynamic look-ahead mode (corridor slides with the driver) or whole-route mode.
- **H3 spatial indexing** — the corridor polygon is rasterised into H3 cells; pickup eligibility is a two-phase filter (H3 broad-phase + exact point-in-polygon narrow-phase).
- **3D H3 hexagons** — deck.gl `H3HexagonLayer`, extruded by eligible-pickup density, with tilt / rotate / zoom.
- **500 mock pickup points** — colour-coded eligible / candidate / ineligible, with interactive popups (ID, H3 cell, status, distance, zone).
- **Service zones** + per-zone analytics (eligible vs total).
- **Performance panel** — total -> H3 candidates -> eligible funnel, plus pipeline processing time in milliseconds.
- **H3 Inspector** — click any cell or pickup to inspect its H3 index, resolution, area, centre, and ring-1 neighbours.
- **Live event log**, **demand heatmap**, **layer toggles**, **route switcher / draw-your-own-route**, **search**, **FPS counter**, **keyboard shortcuts**.
- **Light and dark themes**, fully responsive (desktop / tablet / mobile).

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (CSS-variable theme tokens, light/dark) |
| State | Zustand |
| Animation | Framer Motion |
| 2D map | Leaflet + React-Leaflet (token-free CARTO/OSM tiles) |
| 3D map | deck.gl (`H3HexagonLayer`, `TileLayer`, `ScatterplotLayer`, `PathLayer`) |
| 3D scenes | Three.js via React Three Fiber |
| Spatial | h3-js (v4), Turf.js (v7) |
| Icons | lucide-react |

No map provider API key is required.

---

## The spatial approach (how H3 is used)

```
 Route (LineString)
     | Turf.buffer(route, 350 m)
     v
 Corridor polygon  ----------------->  rendered band (2D) / extruded hexagons (3D)
     | h3.polygonToCells(polygon, res)
     v
 Corridor H3 cell-set  =  { 8a2f..., 8a30..., ... }   (the spatial index)
     ^
     | h3.latLngToCell(point, res)
 Pickup point --> cell --> broad-phase: corridorCells.has(cell)?
                           narrow-phase: exact point-in-polygon(buffer)?
                           --> ELIGIBLE
```

- **Broad-phase (O(1)):** each pickup is mapped to its H3 cell (`latLngToCell`) and tested for membership in the corridor cell-set. This prunes the vast majority of points with a hash lookup instead of an O(n) geometric scan — the pattern that scales to millions of points and many concurrent drivers.
- **Narrow-phase (exact):** only the surviving candidates pay for the precise point-in-polygon test against the 350 m buffer.
- The **Performance panel** shows this funnel live (input -> candidates -> eligible) and the total processing time. Higher H3 resolutions hug the 350 m boundary more tightly (visible in the candidate counts) — the resolution/accuracy trade-off H3 is designed for.

Corridor rebuilds are snapped to ~25 m of driver movement, so the H3 index is never recomputed on every animation frame.

---

## Architecture

```
src/
  config/        config (map, defaults, tiles), shortcuts
  constants/     palette (theme + deck colours)
  types/         shared TypeScript types
  data/          Delhi NCR routes, 500 pickups, service zones
  utils/         geometry (lng/lat <-> lat/lng, bearing), helpers
  services/      PURE spatial engine (no React):
                   routeService  - length / interpolation / slicing
                   bufferService - Turf 350 m buffer
                   h3Service     - polygonToCells, boundaries, inspector
                   geojsonService- point-in-polygon, distance, zone lookup
                   pickupService - two-phase classify + timing + zone stats
  store/         Zustand store (single source of truth)
  hooks/         useSimulation, useSpatialPipeline, useActiveRoute,
                 useFps, useTheme, useKeyboardShortcuts, useEventFeed
  components/
    header/      top bar (status, search, FPS/ms, 2D-3D, theme)
    sidebar/     route, driver status, pickup stats, zone analytics
    controls/    simulation, corridor params, layer toggles
    map/         MapView (2D Leaflet) + DeckView (3D deck.gl) + layers
    panels/      Performance, EventLog, H3Inspector, Shortcuts
    three/       LoadingScreen + HexWaveField (R3F)
    legend/ ui/  legend + design-system primitives
  pages/         Dashboard
  App.tsx, main.tsx
```

The spatial engine (`services/`) is intentionally framework-free, so it is unit-testable and reusable server-side. Coordinates are kept in GeoJSON `[lng, lat]` order everywhere except the Leaflet render boundary.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build and preview:

```bash
npm run build      # tsc -b && vite build -> dist/
npm run preview
```

Type-check only:

```bash
npm run typecheck
```

---

## Deployment (Vercel)

The app is a static site with no API keys or environment variables. It is
configured for Vercel via `vercel.json` (framework `vite`, build `npm run build`,
output `dist`).

1. Push the repo to GitHub (done).
2. On [vercel.com](https://vercel.com), **Add New Project** and import this repo.
3. Vercel auto-detects the Vite framework — no settings to change. Click **Deploy**.

Every future push to `main` redeploys automatically.

---

## Keyboard shortcuts

`Space` play/pause · `R` reset · `1/2/5` speed · `H` H3 grid · `C` corridor · `Z` zones · `M` 2D/3D · `F` follow camera · `T` theme · `E` event log · `P` performance · `/` search · `?` shortcuts.

---

## Evaluation criteria mapping

| Criterion | Where |
| --- | --- |
| Accuracy of spatial calculations | 350 m Turf buffer -> `polygonToCells`; two-phase H3 + exact point-in-polygon; per-point distance verification |
| Quality of visualisation | Themed 2D map, 3D extruded H3 hexagons, layered overlays, animated transitions |
| Code structure and scalability | Framework-free `services/` engine, Zustand store, O(1) H3 broad-phase, snapped recomputation |
| User experience and interface | Playback, draw route, search, panels, shortcuts, responsive, light/dark |
| Overall functionality | Live simulated driver with corridor + eligibility updating in real time |

Map tiles (c) OpenStreetMap contributors (c) CARTO.
