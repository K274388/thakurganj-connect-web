# Backend API & integration guide

The API contract is **[openapi.yaml](openapi.yaml)** (OpenAPI 3.0.3 / Swagger). This guide covers which page needs which endpoint, what to build first, and the exact frontend steps to switch from mock data to the real backend.

**Viewing the spec:** paste it into <https://editor.swagger.io>, open it with the VS Code "OpenAPI (Swagger) Editor" extension, or serve it from Spring Boot with springdoc (`springdoc.swagger-ui.url=/openapi.yaml` with the file in `src/main/resources/static/`).

The spec was checked with `@apidevtools/swagger-parser`. Every record in the four mock JSON files (21 businesses, 8 categories, 18 places, 9 place categories) validates against its schema. So a backend that returns data in this shape renders exactly like the mock does today.

---

## 1. Every page and link, and the API behind it

`x-frontend-status` in the spec: **in-use** = already called by the HTTP repositories; **required** = needed before launch; **planned** = page is static or a placeholder today.

| Route / link | What it shows | API | Status |
|---|---|---|---|
| `/` (home) | Hero, quick links, category shortcuts, "Explore town" places, events, emergency card, stats | `GET /places`, `GET /place-categories` | in-use |
|  | Stats (`245` / `54` hard-coded) | `GET /home/stats` | planned |
|  | "Happening in town" event cards → `/events/:id` | `GET /events?pageSize=3` | planned |
|  | Emergency card (`Coming soon`) | `GET /emergency-contacts` | planned |
| Header NOTICE bar | One hard-coded welcome item | `GET /announcements?active=true&limit=5` | planned |
| `/businesses?search=&category=&subcategory=&area=&sort=&page=` | Directory with filters, sort, paging | `GET /businesses?pageSize=100`, `GET /categories` | in-use |
| `/businesses/:id` | Business profile, call / WhatsApp / directions | `GET /businesses/{id}` | in-use |
| `/categories` | Category grid with counts | `GET /categories` + counts from `GET /businesses` | in-use |
| `/categories/:slug` | Category page, subcategory counts, business preview | same as above (`GET /categories/{slug}` optional) | in-use / planned |
| `/map?type=&category=&search=` | Map of businesses + places | `GET /businesses`, `GET /places`, both category lists (later: `GET /map/items`) | in-use / planned |
| `/my/businesses` | Owner's listings incl. inactive | `GET /my/businesses?pageSize=100` | in-use |
| `/my/business/new`, `/my/businesses/new` | Add business form | `GET /categories`, `POST /my/businesses` | in-use |
|  | Media step (images previewed locally only) | `POST /my/businesses/{id}/images` | planned |
| `/my/businesses/:id/edit` | Edit form, ownership check | `GET /my/businesses`, `PUT /my/businesses/{id}` (later `GET /my/businesses/{id}`) | in-use |
| `/login`, `/register` | Placeholders | `POST /auth/login`, `POST /auth/register` | required |
| (owner identity everywhere) | `MOCK_CURRENT_USER = { id: 1 }` | `GET /auth/me`, `POST /auth/logout` | required |
| `/places`, `/places/:slug` | Redirect to `/` today; place cards and map results already link here | `GET /places`, `GET /places/{slug}` | planned |
| `/events`, `/events/:id` | Placeholders | `GET /events`, `GET /events/{id}` | planned |
| `/announcements`, `/announcements/:id` | Placeholders (header link) | `GET /announcements`, `GET /announcements/{id}` | planned |
| `/emergency` | Placeholder | `GET /emergency-contacts` | planned |
| `/legal/report` | Builds a `mailto:` link | `POST /reports` | planned |
| `/transportation`, `/about`, `/legal/*` (terms, privacy, disclaimer) | Static content in `transportation.data.ts`, `legal.data.ts`, templates | none needed | — |
| `/admin/dashboard` | Placeholder | not specified; scope when admin features are designed | — |

**Links that need no API:** `tel:`, `mailto:`, WhatsApp (`wa.me`), Google Maps directions (`/maps/dir/?api=1&destination=`), the transportation page's external links and OpenStreetMap tiles. They are all built in the browser from fields already in the responses (`phone`, `whatsapp`, `email`, `website`, `latitude`/`longitude`, `address`).

---

## 2. What the backend must build, in order

1. **Phase 1, already wired (7 operations).** `GET /categories`, `GET /businesses`, `GET /businesses/{id}`, `GET /my/businesses`, `POST /my/businesses`, `PUT /my/businesses/{id}`, `GET /places`, `GET /place-categories`. Once these work, switching the flag takes the whole directory, map and owner flow live.
2. **Phase 2, auth (4).** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`. Until then the owner endpoints have no real identity.
3. **Phase 3, planned features.** Images, places detail, events, announcements, emergency contacts, home stats, reports, `/map/items`, `GET /my/businesses/{id}`, `GET /categories/{slug}`.

### Rules the backend must follow (the UI depends on them)

| Rule | Why |
|---|---|
| Accept `pageSize` up to **100**. | The repositories load `?pageSize=100` and filter, sort and paginate in memory (`API_MAX_PAGE_SIZE`). Records beyond 100 are not shown. |
| List envelopes: `{ items, page, pageSize, totalItems, totalPages }`; catalogs: `{ items }`. | `core/api/api-responses.ts` reads `.items`. |
| `GET /my/businesses` items **must include `ownerId`**, equal to `GET /auth/me`'s `id`. | `edit-business.component.ts` opens the form only when `business.ownerId === currentUser.id`; otherwise it shows "forbidden". |
| Public endpoints return only `ACTIVE` / `active: true`; unknown or inactive → `404`. | `404` on `/businesses/{id}` shows "not found"; any other error shows the retry state. |
| `PUT` returns `404` (missing) or `403` (someone else's). | Mapped to `BusinessAccessError('NOT_FOUND' / 'FORBIDDEN')`. |
| Omit absent optional fields; use `""` (not `null`) for `phone`, `whatsapp`, `email`, `website`, `address`, `landmark`, `area`, `imageUrl`. Places use `null` for `latitude`, `longitude`, `coverImageUrl`. | Matches the TypeScript types. A `null` where a `string` is expected can break `.trim()` and other string calls. Spring: `@JsonInclude(NON_NULL)`. |
| Server owns `id`, `slug` (`{name-kebab}-{id}`), `shortDescription` (first 160 chars of `description`), `ownerId`, `status` (`ACTIVE` on create; unchanged on edit), `createdAt`, `updatedAt`. | The request body never contains them (`business-form.mapper.ts`). |
| `PUT` is a full replacement of editable fields; a missing optional field means "clear it". | The form omits empty values instead of sending `""`. |
| Business ids are numbers; place ids and place category ids are strings. | Routes use `/businesses/{id}` and `/places/{slug}`. |
| Errors use `application/problem+json` with `code` and `fieldErrors[].field` matching request paths (e.g. `hours[2].openTime`). | Lets the form map server errors to fields later. |
| Validation mirrors the form (`business-form.config.ts`): name ≤150 (required), phone `^\+?[0-9\s()-]{7,20}$` (required), area ≤100 (required), description ≤1000, email ≤254, website http(s) ≤300, address ≤300, landmark ≤150, PIN `^[0-9]{6}$`, ≤30 services of ≤80 chars, open hours need both `HH:mm` times. | Server validation is authoritative. |
| CORS: allow `http://localhost:4200` and the production origin, methods `GET, POST, PUT, DELETE`, header `Authorization, Content-Type`. | The browser calls the API directly after hydration. |

---

## 3. Frontend integration steps (when the backend is ready)

### Step 1: switch the data source (Phase 1, no code changes)

The repositories already have mock and HTTP implementations behind one interface (`BusinessRepository`, `CategoryRepository`, `PlaceRepository`). They are chosen by `environment.dataSource`.

```ts
// src/environments/environment.development.ts
dataSource: 'http' as 'mock' | 'http',
apiBaseUrl: 'http://localhost:8080/api/v1',
```

Then `npm start` with the backend running on port 8080. Check: `/businesses`, a business detail, `/categories`, `/categories/shopping`, `/map`, `/my/businesses`, add and edit a listing.

For **production** (`environment.ts`), `apiBaseUrl` is currently `''`. **It must be an absolute URL** (e.g. `https://api.thakurganj.connect/api/v1`). Pages are server-rendered, and `HttpClient` on the Node server cannot resolve relative URLs. Alternatively, keep `''` only if the Express server in `src/server.ts` proxies `/api/v1` to the backend **and** the SSR requests are given an absolute origin.

Server-rendered GET responses are reused on the client through Angular's HTTP transfer cache, so each page fetches its data once.

### Step 2: add authentication (Phase 2)

1. **Endpoints.** `API_ENDPOINTS.auth` already exists in `core/api/api-endpoints.ts`.
2. **`AuthService`** (`core/auth/auth.service.ts`). It needs a `user` signal of type `{ id: number; name: string } | null`, plus `login()`, `register()` and `logout()` that call the endpoints, store `accessToken`, and load `GET /auth/me` on startup when a token exists. Store the token only in the browser (guard with `isPlatformBrowser`).
3. **Interceptor**: attach the token to API calls only.
   ```ts
   export const authInterceptor: HttpInterceptorFn = (req, next) => {
     const token = inject(AuthService).token();
     const base = inject(API_CONFIG).baseUrl;
     return token && req.url.startsWith(base)
       ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
       : next(req);
   };
   // app.config.ts
   provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
   ```
   On `401`, clear the token and redirect to `/login?returnUrl=…`.
4. **Replace `MockCurrentUserService`.** It is used in `business.repository.ts` (mock only) and `edit-business.component.ts`. Point both at `AuthService.user()`. Keep the mock service for `dataSource: 'mock'`.
5. **Guard `/my/**`** with a `canActivate` that redirects unauthenticated users to `/login`. The server still enforces ownership independently.
6. **Render private pages in the browser only.** The token is not available during SSR. In `app.routes.server.ts` add `{ path: 'my/**', renderMode: RenderMode.Client }` (and the same for `login` and `register`) before the `'**'` entry. Those pages are already `noindex`. Angular's transfer cache skips requests with an `Authorization` header by default, so private data is never embedded in HTML.
7. **Replace the `/login` and `/register` placeholders** in `app.routes.ts` with real pages.

### Step 3: harden error handling

`apiListResource` (`core/api/api-resource.ts`) turns a failed list request into `[]`, so an API outage looks like an empty directory. When going live, expose an `error` signal next to `items`, and show the existing `tk-error-state` component with a retry that calls `reload()`.

### Step 4: planned features (one at a time)

Follow the existing pattern for each feature (events, announcements, emergency contacts, home stats, places detail, images, reports):

1. Add the path to `API_ENDPOINTS`.
2. Create `<feature>.repository.ts` with an abstract class, a `Mock…Repository` (wrapping today's static data, e.g. `HOME_EVENTS`) and an `Http…Repository` (using `apiListResource` or `HttpClient`), selected with the same `useFactory` on `API_CONFIG.dataSource`.
3. Inject the repository in the component instead of importing the static constant.
4. Add cases to `core/api/http-repositories.spec.ts` (with `HttpTestingController`) asserting the URL, method, body and envelope parsing.
5. Run `npm run test:visual` (the Playwright baseline). In mock mode the UI must stay pixel-identical.

Specific notes:

- **Images:** after `POST`/`PUT /my/businesses` succeeds, upload the media step's files with `FormData` to `POST /my/businesses/{id}/images`, then reload. Keep `BUSINESS_MEDIA_CONFIG` (8 files, 5 MiB, JPEG/PNG/WebP) in sync with the server limits.
- **Places pages:** remove the two `places` redirects in `app.routes.ts` once `/places` and `/places/:slug` exist.
- **Map at scale:** when there are more than 100 businesses or places, switch `MapExplorerComponent` to `GET /map/items` (the `MapItem` shape is identical to `buildMapItems()` output), and move the directory to server-side `search`/`category`/`area`/`sort`/`page` (the query parameters already have the same names).
- **Edit page:** once `GET /my/businesses/{id}` exists, load the single record instead of searching the owner list.

### Step 5: keep the contract honest

- `openapi.yaml` is the single source of truth. Change it in the same PR as any model or endpoint change, and keep `api-endpoints.ts` in sync.
- The backend can generate DTOs and controller interfaces from it (`openapi-generator` with the `spring` generator, `interfaceOnly=true`), or the frontend can generate types with `openapi-typescript`.
- Re-run schema validation of the mock JSON against `components.schemas` (as done for this document) whenever the mocks or the spec change.

---

## 4. Go-live checklist

- [ ] Phase 1 endpoints return the shapes in `openapi.yaml`, including the `pageSize=100` limit
- [ ] `/my/businesses` responses include `ownerId`
- [ ] CORS configured for dev and prod origins
- [ ] `environment.ts` `apiBaseUrl` is absolute; `dataSource: 'http'`
- [ ] Auth endpoints done; `AuthService`, interceptor and `/my/**` guard added; `MockCurrentUserService` removed from production paths
- [ ] `my/**`, `login`, `register` set to `RenderMode.Client`
- [ ] List error state added (no silent empty lists)
- [ ] `npm test` and `npm run test:visual` pass
