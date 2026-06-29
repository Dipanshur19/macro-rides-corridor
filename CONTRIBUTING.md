# Contributing

Thanks for your interest in improving the Macro Rides Dispatch Console.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck   # TypeScript must pass
npm run build       # production build must succeed
```

## Conventions

- TypeScript everywhere; keep the `services/` layer free of React imports.
- Coordinates are GeoJSON `[lng, lat]` except at the Leaflet render boundary.
- Styling via Tailwind utility classes and the CSS-variable theme tokens (`src/styles/index.css`); support both light and dark themes.
- Use `lucide-react` icons. Do not introduce emojis into the UI, code, or docs.
- Keep heavy spatial recomputation memoised and snapped to driver movement.

## Project structure

See the Architecture section in `README.md`.
