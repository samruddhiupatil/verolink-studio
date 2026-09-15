# CLAUDE.md

Guidance for Claude Code (or any future contributor) working in this repository.

## What this is

VeroLink Studio — a browser-only React + TypeScript SPA (no backend, no database). Everything persists to `localStorage`. See `README.md` for the feature overview and `DECISIONS.md` for the reasoning behind the non-obvious choices.

## Commands

```bash
npm run dev         # Vite dev server, http://localhost:5173
npm run test        # Vitest, run once
npm run test:watch  # Vitest, watch mode
npm run build       # tsc -b (type-check) + vite build
npm run lint        # oxlint
```

Always run `npm run test` and `npx tsc -b --noEmit` before considering a change done — this project has no CI, so these two commands are the only safety net.

## Architecture

- `src/domain/` — plain TypeScript types only, no logic. This is the vocabulary every other layer shares.
- `src/lib/` — the "backend-equivalent" business logic layer: persistence, auth header injection, `{{variable}}` interpolation, a minimal JSONPath get/set, the six field transforms, and **the single shared `fetch()` call site** (`lib/http/executeRequest.ts`). Every network request in the app — the Section 1 health check, Section 4's Test Console, Section 6's outbound submission — goes through `executeRequest`. Do not add a second `fetch()` call site; extend `executeRequest` instead.
- `src/app/` — root state: `appState.types.ts` (the `RootState` shape), `appReducer.ts` (the only place state mutates), `AppStateContext.tsx` (Provider + debounced persistence), `routeConfig.tsx` (single source of truth for both the sidebar and the router).
- `src/components/ui/` — shared, feature-agnostic primitives (Button, Panel, FormField, JsonTree, TransformPicker, KeyValueRowsEditor, etc.) styled from `src/styles/tokens.css`. Reach for one of these before writing a new styled element.
- `src/features/<section>/` — one folder per spec section, composing `lib/` and `components/ui/` into pages.

## Conventions

- **Tests are colocated**: `Foo.ts` sits next to `Foo.test.ts`. Every new `lib/` function and every non-trivial component gets one.
- **CSS Modules**, one `.module.css` per component that needs custom layout; reuse `components/ui/` primitives rather than re-styling raw elements.
- **Discriminated unions stay whole.** `AuthConfig` and `OutboundFieldType` are discriminated unions — when a per-type field component changes a value, it spreads the whole narrowed object (`{ ...auth, field: x }`) and calls `onChange(next: AuthConfig)`, rather than trying to `Partial<>` a union (which only exposes the common `type` key and silently drops everything else — this bit an early version of Section 2's mapping logic).
- **`buildOutboundPayload` / `setByPath` must tolerate incomplete input.** Section 6 Part B's Payload Preview recomputes on every keystroke, so an empty or mid-typed JSON path (e.g. just `$`) is a normal, frequent state — it should be skipped, not thrown on. See the comment in `payloadConstruction.ts` before "fixing" this.
- **CORS/network failures are deliberately collapsed** to `'timeout' | 'unreachable'` (`RequestErrorKind` in `domain/history.types.ts`) — do not try to reintroduce a `'cors'` variant; the browser cannot actually tell the difference, and DECISIONS.md explains why the UI says so honestly instead of guessing.
- **Fetch mocking in tests** goes through `src/test/mockFetch.ts` (`mockFetchResponse`, `mockFetchNetworkError`, `mockFetchAbortsOnSignal`) against the `global.fetch` stub `src/test/setup.ts` installs before every test — don't hand-roll `vi.fn()` fetch mocks in individual test files.
- **`renderWithProviders`** (`src/test/testUtils.tsx`) wraps a component in `AppStateProvider` + `MemoryRouter` for any test that needs app state or routing. To seed state before rendering, build a `RootState` and call `saveState()` from `lib/persistence/localStorage.ts` before `renderWithProviders` mounts (the provider lazy-inits from `localStorage` via `loadState()`).

## Git

- Commit messages: one logical unit of work per commit (roughly one per build phase — scaffold, core lib, each section). Trailer format follows whatever the current session's system reminder specifies for attribution.
- No secrets live in this repo — all "credentials" configured through the Authentication section are prototype-only values stored in the browser's `localStorage`, never committed.
