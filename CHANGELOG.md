# Changelog

All notable changes to this project are documented here.

## [2.0.0]

### Added
- Full rewrite into a TypeScript dispatch operations dashboard.
- 3D extruded H3 hexagon view (deck.gl `H3HexagonLayer`) with tilt/rotate/zoom.
- Three.js (React Three Fiber) animated loading scene.
- Two-phase pickup eligibility pipeline (H3 broad-phase + exact narrow-phase) with live processing-time instrumentation.
- Performance panel, H3 Inspector, live event log, demand heatmap, zone analytics.
- Light and dark professional themes, keyboard shortcuts, global search, FPS counter.
- Delhi NCR dataset: 3 routes, 500 mock pickups, 4 service zones.
- Zustand state store; Tailwind CSS design system; Framer Motion transitions.

### Changed
- Migrated from JavaScript to TypeScript and from hand-written CSS to Tailwind.
- Relocated all spatial logic into a framework-free `services/` layer.

## [1.0.0]
- Initial demo: 350 m corridor with H3 eligibility on React + Leaflet.
