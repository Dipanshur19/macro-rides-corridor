# Macro Rides — Zone Boundary + Dynamic Route Corridor Visualization Tool

A web demo that, given a driver's live route, draws a **350 m buffer corridor**
around the route, indexes that corridor with **H3** (Uber's hexagonal spatial
index), and highlights every **eligible pickup point** that falls inside it — in
real time as the driver moves.

> **Stack:** React + Vite · **H3** (`h3-js` v4) for spatial indexing/queries ·
> **Leaflet** (`react-leaflet`) for map rendering · **Turf.js** for geometry.

---

## ✨ What it does

- **Driver's route** — a polyline with a live, moving driver marker (simulated GPS).
- **350 m corridor** — a buffer "tube" generated around the route with Turf.
- **Zone boundaries** — operational service zones drawn as polygons.
- **Eligible pickup points** — points inside the corridor are highlighted green;
  the rest are dimmed. Eligibility is decided by an **H3 cell-membership test**.
- **Real-time / simulated updates** — press **Play** and watch eligibility change
  as the driver advances along the route.

### Interactive controls
- Play / pause / reset / scrub the driver along the route, adjustable speed.
- **Corridor buffer width** (100–750 m) and **H3 resolution** (8–11) sliders —
  the live stats show the accuracy/granularity trade-off.
- **Dynamic look-ahead** corridor (slides with the driver) vs **whole-route** mode.
- Toggle layers: corridor buffer, **raw H3 cells**, service zones, ineligible points.
- **Draw your own route** by clicking waypoints on the map.

---

## 🧠 The spatial approach (how H3 is used)

This is the core of the assignment. The eligibility decision is **not** a naive
"loop over every point and measure distance" — it uses H3 as a spatial index, the
pattern that scales to millions of points and many concurrent drivers.

```
 1. Route (LineString)
        │  Turf.buffer(route, 350 m)
        ▼
 2. Corridor polygon  ───────────────►  (rendered as the translucent band)
        │  h3.polygonToCells(polygon, res)
        ▼
 3. Corridor cell-set  =  { 8a2f… , 8a30… , … }   ← the SPATIAL INDEX
        ▲
        │  h3.latLngToCell(point, res)
 4. Pickup point  ──►  cell  ──►  corridorCells.has(cell)  ?  ELIGIBLE : not
```

- **Step 2 → 3** (`polygonToCells`): the corridor polygon is rasterised into the
  set of H3 cells that cover it. This set *is* the index of "inside the corridor".
- **Step 4** (`latLngToCell` + `Set.has`): a pickup point is mapped to its H3 cell
  and tested for membership in the corridor set. This is an **O(1)** hash lookup
  per point instead of an O(n) geometric scan — the key scalability win.
- For **transparency/verification**, the app *also* computes each point's exact
  perpendicular distance to the route (`turf.pointToLineDistance`) and shows it in
  the tooltip. Higher H3 resolutions make the cell coverage hug the 350 m boundary
  more tightly (visible in the live stats), which is the resolution/accuracy
  trade-off H3 is designed around.

**Why H3 (hexagons)?** Uniform neighbour distances, no projection distortion at
city scale, and cheap `Set` membership — ideal for "is this point near the route"
queries done continuously for live drivers.

### Dynamic corridor
In **look-ahead** mode the corridor is rebuilt around only the slice of route from
just behind the driver to a configurable distance ahead. As the driver moves, the
corridor slides and pickup eligibility updates live — the "dynamic route corridor"
the brief asks for. Corridor rebuilds are snapped to ~25 m of movement so the H3
index isn't recomputed on every animation frame.

---

## 🗂 Architecture

Separation of concerns keeps the **spatial engine independent of the UI** (easy to
unit-test and reuse server-side).

```
src/
├── config/
│   └── constants.js          # map defaults, colours, H3 resolution reference table
├── data/
│   ├── routes.js             # preset driver routes (GeoJSON [lng,lat])
│   ├── zones.js              # operational service zones (GeoJSON FeatureCollection)
│   └── pickupPoints.js       # deterministic (seeded) pickup-point generator
├── lib/                      # ── pure spatial engine (no React) ──
│   ├── geo.js                # Turf helpers: buffer, slice, distance, lat/lng convert
│   └── h3Corridor.js         # H3: polygonToCells, eligibility, cell→polygon, area
├── hooks/
│   └── useRouteSimulation.js # rAF-driven driver movement (play/pause/seek/speed)
├── components/
│   ├── MapView.jsx           # Leaflet map + fit-bounds + draw handler
│   ├── ControlPanel.jsx      # all controls
│   ├── StatsPanel.jsx        # live eligibility metrics
│   └── layers/               # one React-Leaflet layer per concern
│       ├── ZonesLayer.jsx
│       ├── RouteLayer.jsx
│       ├── CorridorLayer.jsx
│       ├── H3CellsLayer.jsx
│       ├── PickupPointsLayer.jsx
│       └── DriverMarker.jsx
├── App.jsx                   # state + memoised spatial pipeline + layout
└── main.jsx                  # entry
```

**Coordinate convention:** the spatial engine works entirely in GeoJSON `[lng, lat]`
order (matching Turf and H3's GeoJSON mode); conversion to Leaflet's `[lat, lng]`
happens only at the rendering boundary (`toLatLng` / `toLatLngs`). This avoids the
single most common class of geospatial bugs.

---

## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build / preview:

```bash
npm run build      # outputs to dist/
npm run preview
```

## ☁️ Deploy

The app is a static site (no API keys — uses free OpenStreetMap/CARTO tiles), so it
deploys anywhere:

- **Netlify** — config in `netlify.toml` (build `npm run build`, publish `dist`).
- **Vercel** — config in `vercel.json` (framework `vite`).
- **GitHub Pages** — `npm run build` then publish `dist/` (the build uses a relative
  `base`, so it works from a subpath).

---

## ✅ Mapping to the evaluation criteria

| Criterion | Where it shows up |
|---|---|
| Accuracy of spatial calculations | 350 m Turf buffer → `polygonToCells`; per-point distance verification; live res/accuracy stats |
| Quality of visualization | Dark basemap, layered corridor/zones/H3/route/driver, tooltips, legend, stats |
| Code structure & scalability | Pure `lib/` spatial engine separate from UI; O(1) H3 membership; memoised, snapped recomputation |
| User experience & interface | Play/scrub/speed, draw-your-own-route, layer toggles, live metrics, responsive layout |
| Overall functionality | Real-time simulated driver with live-updating corridor & eligibility |

---

## 🛠 Tech stack & versions

| Library | Purpose | Version |
|---|---|---|
| `h3-js` | Hexagonal spatial indexing & queries | 4.x |
| `react-leaflet` / `leaflet` | Map rendering | 4.x / 1.9 |
| `@turf/*` | Buffer, slice, distance geometry | 7.x |
| `react` / `vite` | App framework / build | 18 / 5 |

Map tiles © OpenStreetMap contributors © CARTO.
