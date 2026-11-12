# React `use(promise)` playground

A small Vite + React 19 + TypeScript + MUI app to compare reading a promise directly with `use(promise)` and hiding that detail behind a domain-specific hook.

## Run it

```sh
npm install
npm run dev
```

Click either button and watch the Suspense fallback while the simulated promise is pending, then compare the two readers.

## What to notice

- The promise is created in the click handler and stored in state. It is not recreated during render.
- `DirectReader` calls React's `use(promise)` itself.
- `HookReader` calls `useAlbums(promise)`, which centralizes the unwrapping convention and return type.
- `useAlbums` does not create or cache the promise. The caller and data layer still own that responsibility.
- A pending promise suspends to the nearest `<Suspense>` boundary. A rejected promise needs an Error Boundary.

The wrapper is only useful if it gives the app a meaningful domain-level API or consistently centralizes promise reading. For one consumer, direct `use` may be clearer. This is a learning demo, not a recommendation to replace a query library for ordinary client-side fetching.
