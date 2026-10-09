# Thakurganj Connect

Angular application for the Thakurganj, Bihar local information directory. The project uses standalone Angular components, SCSS, Angular Router, HttpClient, and server-side rendering (SSR).

## Prerequisites

- Node.js compatible with the installed Angular CLI version
- npm

## Install and run

```bash
npm install
npx ng serve
```

Open [http://localhost:4200](http://localhost:4200). The dev server uses `src/environments/environment.development.ts`; configure its `apiBaseUrl` when connecting a local API.

You can also start the development server with `npm start`.

## Build and tests

```bash
npm run build
npm test
```

## Application structure

- `src/app/core` contains application-wide infrastructure.
- `src/app/shared` contains reusable UI components and the centralized Thakurganj design tokens/styles.
- `src/app/layout` contains the public application shell and reusable announcement, header, and footer components, plus user and admin layouts.
- `src/app/features` is reserved for public feature areas.
- `src/app/admin` contains the separate admin shell.
- `src/environments` contains production and development configuration.

The homepage, mock-data business directory (`/businesses`) business details page (`/businesses/:id`) and categories pages (`/categories`, `/categories/:slug`) are implemented as lazy-loaded public features. Other routes currently render lightweight placeholders; their feature behavior and API integration are deferred to subsequent implementation stories.

Shared standalone UI components can be imported individually or through `src/app/shared/components/index.ts`. Global visual tokens are defined in `src/app/shared/styles/_variables.scss` and loaded by `src/styles.scss`.

Categories and subcategories live in one mock source of truth, `src/app/features/categories/data/category.mock.ts`, consumed by Home, the Business Directory and the Categories pages. It is intended to be replaced by a `CategoryService` backed by `GET /api/v1/categories`.

The backend endpoints and request/response contracts for the implemented directory flows are documented in [the backend API contract](./docs/backend-api-contract.md).

## My businesses (ANG-007)

- `/my/businesses` lists the current owner's businesses; `/my/business/new` is the Add Business form (Reactive Forms). Both are `noindex`. `/my/businesses/new` remains a compatible legacy URL.
- A valid save creates an `ACTIVE` business immediately (no approval workflow) via the in-memory `BusinessRepository`, which also feeds the public directory and details pages. Data resets on reload.
- `MOCK_CURRENT_USER` stands in for authentication until `AuthStore` exists. Photo selections are previewed locally and never uploaded.

## Edit business (ANG-008)

- `/my/businesses/:id/edit` reuses `BusinessFormComponent` in `edit` mode. The page checks ownership, and `BusinessRepository.updateBusiness(id, ownerId, request)` enforces it again independently.
- Editing never changes `status` (an INACTIVE listing stays INACTIVE); owners have no activate/deactivate/delete controls.
