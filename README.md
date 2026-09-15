# VeroLink Studio

A browser-based prototype of VeroLink Studio — VeroTX's connector-builder admin tool — built for the VeroTX Software Intern Assessment (Test 2). It's a single-page app for defining a connector's identity, authentication, a reusable endpoint library, a live test console, response-to-canonical-schema field mapping, and an outbound write-back form, entirely client-side against the [JSONPlaceholder](https://jsonplaceholder.typicode.com) mock API.

## Running it

```bash
npm install
npm run dev       # starts Vite at http://localhost:5173
npm run test      # runs the Vitest suite once
npm run test:watch
npm run build      # type-checks (tsc -b) and produces a production build
```

No environment variables, no backend, no database — everything persists to the browser's `localStorage`.

### Try it

1. **Connector Identity** — fill in a connector name and set the Base URL to `https://jsonplaceholder.typicode.com`, then click "Check Connection Health."
2. **Endpoint Library** — add `GET /users`, `GET /users/{{id}}`, and `POST /posts`.
3. **Test Console** — select `GET /users/{{id}}`, fill in `id`, and run it.
4. **Field Mapping** — map a field from that response (e.g. `$.name`) to a canonical field with a transform.
5. **Outbound Form** — in Admin View, build a Title/Body/Author ID form mapped to `POST /posts` (`$.title`/`$.body`/`$.userId`); switch to User View in the header and submit.

## Stack & libraries

- **React 19 + TypeScript + Vite** — the required stack.
- **react-router-dom** (`HashRouter`) — six sidebar-driven routes; hash routing needs no server rewrite rules for a purely static/local app.
- **@dnd-kit/core + @dnd-kit/sortable** — drag-and-drop reordering for the Outbound Form Builder's fields. Chosen over `react-beautiful-dnd` (unmaintained) and native HTML5 drag-and-drop (its events aren't simulable in jsdom, so it isn't testable) — dnd-kit's keyboard sensor made the reorder logic exercisable in Vitest/RTL.
- **date-fns** — the ISO → DD/MM/YYYY transform.
- **nanoid** — ids for endpoints, history entries, form fields.
- **Vitest + React Testing Library + jsdom** — the test stack, with a centralized `global.fetch` stub (`src/test/setup.ts` + `src/test/mockFetch.ts`) so any test exercising the shared `executeRequest` call site doesn't hand-roll fetch mocking.
- **CSS Modules + a small hand-rolled UI kit** (`src/components/ui/`) — no Tailwind or component library; a dozen or so primitives (Button, Badge, Input/Select/Textarea, Panel, SegmentedToggle, Switch, SecretField, StatusPill, a recursive JsonTree, TransformPicker, KeyValueRowsEditor) built on a shared `tokens.css` design-token sheet, so the six sections read as one coherent tool rather than six differently-styled pages.

No JSONPath, drag-and-drop-everywhere, or state-management library beyond React's own Context + `useReducer` — see `DECISIONS.md` for why.

## Project structure

```
src/
  app/            AppShell (sidebar, environment badge, Admin/User toggle), routing, root Context+reducer, RootState
  domain/         TypeScript types for every domain concept (connector, auth, endpoint, history, mapping, outbound)
  lib/            The "backend-equivalent" logic layer — persistence, auth header injection, {{variable}} interpolation,
                   a minimal JSONPath get/set, the 6 transforms, the single shared fetch call site, validation, export
  components/ui/  Shared, feature-agnostic UI primitives
  features/       One folder per spec section (connector-identity, authentication, endpoint-library, test-console,
                   field-mapping, outbound-forms/{builder,mapping,runtime})
  test/           RTL setup, fetch-mock helpers, a renderWithProviders() test util
```

Nearly every `.ts`/`.tsx` file under `lib/` and most component files have a colocated `.test.ts(x)` — 200 tests total.

## What I'd build next

1. **Connector Simulation Mode** (the spec's suggested bonus). Let an admin upload a sample JSON response file instead of hitting a live URL, and run the Test Console + Field Mapping flow against that fixture. This is the single highest-value next feature: it's the only way to build/demo a connector to a system (SAP, Workday, a real NetSuite instance) that isn't reachable from wherever VeroLink Studio happens to be running — which, per the CORS discussion in `DECISIONS.md`, is most real target systems from a pure browser SPA with no proxy.
2. **A real backend proxy for auth and CORS.** Right now every request — test console, health check, outbound submission — goes straight from the browser to the target host, so OAuth2 token fetches are simulated and most real target systems will fail with an (honestly reported, but still blocking) CORS/unreachable error. A thin server-side proxy that holds credentials server-side, performs the actual OAuth2 token exchange, and forwards requests would remove both limitations at once — turning this from a demo into something that could talk to a real SAP or NetSuite sandbox.
3. **Endpoint- and connector-level versioning / diffing.** Endpoints and field mappings can currently be edited freely with no history. A "connector version" concept — snapshotting the full `RootState` on demand, diffing two versions, and letting an admin roll back — would matter a lot once multiple people or environments share a connector, and pairs naturally with the `connector-mapping.json` export format already being schema-versioned.
4. **Multi-connector support.** The app currently holds exactly one connector's worth of state in `localStorage`. A connector list/switcher (each with its own persisted `RootState`, keyed by connector id) is the natural next step once this moves past prototype stage — VeroLink in practice would manage many connectors, not one.
