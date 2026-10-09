# Backend API contract for Thakurganj Connect

This document describes the backend contract needed to replace the current in-memory/mock data used by the Angular app. It is intended as a starting point for backend implementation; the frontend has not yet been wired to these endpoints.

The development environment already points to `http://localhost:8080/api/v1` in `src/environments/environment.development.ts`. The README describes Spring Boot as the intended backend, but the contract is HTTP/JSON and does not require a specific implementation framework.

## Scope and priority

### Needed for the implemented directory experiences

1. Business category and subcategory catalog.
2. Public business search/list and business detail.
3. Authenticated owner business list, create, detail-for-edit, and update.
4. Place category catalog, place search/list, and place detail.
5. Combined map items, or equivalent business/place list calls that can supply every map marker.
6. Authentication/current-user identity for owner-only operations.

The homepage's town facts, gallery, category shortcuts, places, about text, header announcement, and emergency details are currently static/template data. `/events`, `/announcements`, `/emergency`, `/login`, `/register`, and `/admin/dashboard` are placeholder routes, not implemented data-driven features. Their APIs should be scoped when those features are designed rather than treated as required to connect the current directory.

## API conventions

- Base path: `/api/v1`.
- Request and response media type: `application/json; charset=utf-8`.
- All date-times are ISO 8601 UTC strings, for example `2026-10-08T20:45:10Z`.
- `page` is 1-based and `pageSize` is bounded by the server (the current UI uses 12).
- Public endpoints return only active/public records. Do not expose inactive business or place details publicly; use `404` for an unknown or inactive public record.
- Business `id` values are numeric in the current mock data and public routes use `/businesses/:id`. Place detail URLs use stable string slugs.
- Category and subcategory slugs are stable URL identifiers. The business taxonomy currently uses numeric IDs; place categories currently use string IDs.
- Apply CORS for the configured local frontend origin (normally `http://localhost:4200`) and the deployed frontend origin.
- Authenticate owner endpoints. The backend derives the owner from the authenticated principal; never trust an `ownerId` supplied in a request body or query string.

### Pagination response

All directory endpoints should return the same envelope:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "totalItems": 0,
  "totalPages": 0
}
```

`totalItems` must reflect all records matching the filters, not just the current page. The current frontend paginates in memory; when connected to this API it must use the server page and counts instead.

## 1. Authentication and current user

These endpoints are required before replacing `MockCurrentUserService` and enabling real owner management. The login/register screens themselves are placeholders today.

### `POST /auth/register`

Request:

```json
{
  "name": "Asha Kumar",
  "email": "asha@example.com",
  "password": "example-only-password"
}
```

Success: `201 Created`; response uses the same shape as `GET /auth/me`, plus the chosen token/session mechanism.

### `POST /auth/login`

Request:

```json
{
  "email": "asha@example.com",
  "password": "example-only-password"
}
```

Success: `200 OK`.

```json
{
  "accessToken": "<opaque-or-signed-token>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 42,
    "name": "Asha Kumar",
    "email": "asha@example.com"
  }
}
```

For bearer-token auth, send `Authorization: Bearer <accessToken>` to private endpoints. If cookie sessions are selected instead, document the cookie and CSRF behavior and configure credentialed CORS. The frontend must use the same auth mechanism consistently.

### `GET /auth/me`

Requires authentication. Returns:

```json
{
  "id": 42,
  "name": "Asha Kumar",
  "email": "asha@example.com"
}
```

### `POST /auth/logout`

Requires authentication. Returns `204 No Content` (or invalidates the session/token according to the chosen mechanism).

## 2. Business categories and subcategories

### `GET /categories`

Returns active categories, ordered by `displayOrder`; include active subcategories nested under each category. Counts are based on active/public businesses.

```json
{
  "items": [
    {
      "id": 1,
      "slug": "food-restaurants",
      "name": "Food & Restaurants",
      "description": "Restaurants, food shops and local places to eat.",
      "icon": "utensils",
      "visualVariant": "dark",
      "displayOrder": 1,
      "active": true,
      "businessCount": 12,
      "subcategories": [
        {
          "id": 101,
          "categoryId": 1,
          "slug": "restaurant",
          "name": "Restaurant",
          "description": null,
          "displayOrder": 1,
          "active": true,
          "businessCount": 4
        }
      ]
    }
  ]
}
```

Supported visual variants currently used by the frontend are `dark`, `yellow`, `magenta`, `cream`, and `light`. The backend may omit `icon`, `description`, or `visualVariant` when unavailable. IDs and slugs must be consistent; the backend validates that a selected subcategory belongs to its category.

### `GET /categories/{slug}`

Returns one category with its active subcategories, active business counts, and up to six public business previews for the category detail page. Unknown slug: `404`; known but inactive slug: `404` publicly.

```json
{
  "id": 1,
  "slug": "food-restaurants",
  "name": "Food & Restaurants",
  "description": "Restaurants, food shops and local places to eat.",
  "icon": "utensils",
  "visualVariant": "dark",
  "displayOrder": 1,
  "active": true,
  "businessCount": 12,
  "subcategories": [
    {
      "id": 101,
      "categoryId": 1,
      "slug": "restaurant",
      "name": "Restaurant",
      "displayOrder": 1,
      "active": true,
      "businessCount": 4
    }
  ],
  "businessPreview": []
}
```

The `businessPreview` elements use the business response shape below (at least `id`, `name`, category, area, image, and short description).

## 3. Public business directory and details

### `GET /businesses`

Query parameters (all optional unless indicated):

| Parameter | Meaning |
|---|---|
| `search` | Case-insensitive substring search over name, short description, category/subcategory names, services, and area. |
| `category` | Category slug, e.g. `food-restaurants`. |
| `subcategory` | Subcategory slug, e.g. `restaurant`; must belong to the selected category when both are supplied. |
| `area` | Area slug used by the directory query string, e.g. `main-road`. Resolve against the stored/display area consistently. |
| `sort` | `name-asc` (default), `name-desc`, or `newest`. |
| `page` | 1-based; default `1`. |
| `pageSize` | Default `12`; enforce a reasonable maximum such as `100`. |

Example:

`GET /api/v1/businesses?search=chai&category=food-restaurants&area=main-road&sort=name-asc&page=1&pageSize=12`

Response `200 OK`:

```json
{
  "items": [
    {
      "id": 27,
      "slug": "sample-chai-corner-27",
      "name": "Sample Chai Corner",
      "category": "Food & Restaurants",
      "categoryId": 1,
      "categorySlug": "food-restaurants",
      "categoryName": "Food & Restaurants",
      "subcategoryId": 105,
      "subcategorySlug": "tea-shop",
      "subcategoryName": "Tea Shop",
      "shortDescription": "Tea, snacks and takeaway.",
      "phone": "+911234567890",
      "whatsapp": "+911234567890",
      "email": "hello@example.com",
      "website": "https://example.com",
      "address": "12 Main Road",
      "area": "Main Road",
      "landmark": "Near the market",
      "pinCode": "855116",
      "latitude": 26.1,
      "longitude": 87.9,
      "imageUrl": "https://cdn.example.com/businesses/27/cover.webp",
      "logoUrl": null,
      "coverImageUrl": "https://cdn.example.com/businesses/27/cover.webp",
      "services": ["Tea", "Snacks"],
      "status": "ACTIVE",
      "createdAt": "2026-10-08T12:00:00Z",
      "updatedAt": "2026-10-08T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 1,
  "totalPages": 1
}
```

List records may omit detail-only values such as `description`, `hours`, and `images`; all fields used by the cards and filters must be present. `imageUrl` is the card fallback image URL.

### `GET /businesses/{id}`

Returns one active public business using the full business representation, including:

```json
{
  "id": 27,
  "slug": "sample-chai-corner-27",
  "name": "Sample Chai Corner",
  "category": "Food & Restaurants",
  "categoryId": 1,
  "categorySlug": "food-restaurants",
  "categoryName": "Food & Restaurants",
  "subcategoryId": 105,
  "subcategorySlug": "tea-shop",
  "subcategoryName": "Tea Shop",
  "shortDescription": "Tea, snacks and takeaway.",
  "description": "Full public business description.",
  "phone": "+911234567890",
  "whatsapp": "+911234567890",
  "email": "hello@example.com",
  "website": "https://example.com",
  "address": "12 Main Road",
  "area": "Main Road",
  "landmark": "Near the market",
  "pinCode": "855116",
  "latitude": 26.1,
  "longitude": 87.9,
  "imageUrl": "https://cdn.example.com/businesses/27/cover.webp",
  "logoUrl": null,
  "coverImageUrl": "https://cdn.example.com/businesses/27/cover.webp",
  "images": [
    {
      "url": "https://cdn.example.com/businesses/27/interior.webp",
      "alt": "Interior of Sample Chai Corner"
    }
  ],
  "services": ["Tea", "Snacks"],
  "hours": [
    { "day": "monday", "openTime": "09:00", "closeTime": "20:00", "closed": false },
    { "day": "sunday", "closed": true }
  ],
  "status": "ACTIVE",
  "createdAt": "2026-10-08T12:00:00Z",
  "updatedAt": "2026-10-08T12:00:00Z"
}
```

Hours use lowercase weekday names (`monday` through `sunday`) and 24-hour `HH:mm` times. Omit times for a closed day. Return `404` for unknown or inactive records on this public route.

## 4. Owner business management

Every endpoint in this section requires an authenticated account.

### `GET /my/businesses`

Returns only the authenticated owner's records, including inactive ones, in the pagination envelope. The frontend needs `id`, `name`, category labels, `area`, image URLs, and `status`.

### `GET /my/businesses/{id}`

Returns the full business representation for the authenticated owner, including inactive records, so an owner can edit a non-public listing. Return `404` if the record does not exist or belongs to another owner; do not reveal another owner's record.

### `POST /my/businesses`

Creates a business and immediately makes it `ACTIVE` and public. There is no approval workflow in the current app. Owner ID, status, slug, timestamps, and short description are backend-owned fields and must not be accepted as authoritative client input.

Request:

```json
{
  "name": "Sample Chai Corner",
  "categoryId": 1,
  "categorySlug": "food-restaurants",
  "subcategoryId": 105,
  "subcategorySlug": "tea-shop",
  "description": "Tea, snacks and takeaway.",
  "phone": "+911234567890",
  "whatsapp": "+911234567890",
  "email": "hello@example.com",
  "website": "https://example.com",
  "address": "12 Main Road",
  "area": "Main Road",
  "landmark": "Near the market",
  "pinCode": "855116",
  "latitude": 26.1,
  "longitude": 87.9,
  "services": ["Tea", "Snacks"],
  "hours": [
    { "day": "monday", "openTime": "09:00", "closeTime": "20:00", "closed": false },
    { "day": "sunday", "closed": true }
  ]
}
```

Required by the current form: `name`, `categoryId`/`categorySlug`, `phone`, and `area`. Other fields are optional. The form currently sends both category ID and slug; validate they identify the same active category. Return `201 Created` with the full created business representation, including its generated ID, slug, `status: "ACTIVE"`, owner identity (only if useful to the private UI), and timestamps.

### `PUT /my/businesses/{id}`

Updates the editable business fields using the same request shape as create. Treat it as replacement of the form-editable values: omitted optional form values are cleared, matching the current form mapper. Preserve the original ID, slug, owner, status, and created timestamp. Editing an inactive listing must leave it inactive. Return `200 OK` with the updated full representation.

No delete, activate/deactivate, or status-change endpoint is required by the current UI.

## 5. Place categories and directory

### `GET /place-categories`

Returns active place categories ordered by `displayOrder`.

```json
{
  "items": [
    {
      "id": "place-category-landmarks",
      "slug": "landmarks",
      "name": "Landmarks",
      "icon": "★",
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

Place category slugs currently used by the UI are `landmarks`, `religious`, `markets`, `transportation`, `hospitals`, `schools`, `parks`, `sports`, and `other`.

### `GET /places`

Query parameters: `search`, `category` (category slug), `page` (default `1`), and `pageSize` (default `12`). Search over name, category name, short/full description, address, area, and landmark. Return active places sorted by `displayOrder`, then name, in the pagination envelope.

List items use the following shape:

```json
{
  "id": "place-thakurganj-junction",
  "slug": "thakurganj-junction",
  "name": "Thakurganj Junction",
  "categoryId": "place-category-transportation",
  "categorySlug": "transportation",
  "categoryName": "Transportation",
  "shortDescription": "Railway station in Thakurganj.",
  "address": "Thakurganj",
  "area": "Thakurganj",
  "landmark": "",
  "pinCode": "",
  "latitude": null,
  "longitude": null,
  "coverImageUrl": null,
  "images": [],
  "featured": true,
  "active": true,
  "displayOrder": 1
}
```

### `GET /places/{slug}`

Returns the place above plus full `description` and full-size `images` for the details page. Each image can be a URL string, as the current `Place` model expects. The detail page shows address/area/landmark/PIN, gallery, map directions when coordinates exist, and up to three related active places. The backend may return `relatedPlaces` (same compact shape) or the frontend can request related entries from the place list. Unknown/inactive public place: `404`.

## 6. Map markers

The map displays the union of active businesses and places that have valid coordinates. It filters by type, category, and search text and needs all matching markers, not paginated directory cards.

### `GET /map/items`

Query parameters:

- `type`: `business`, `place`, or `all` (default).
- `category`: a slug for typed requests; in `all` mode use `business:food-restaurants` or `place:transportation`.
- `search`: search name, category name, area, or short description.

Response:

```json
{
  "items": [
    {
      "key": "business-27",
      "entityType": "business",
      "id": 27,
      "slug": "sample-chai-corner-27",
      "name": "Sample Chai Corner",
      "categoryId": 1,
      "categorySlug": "food-restaurants",
      "categoryName": "Food & Restaurants",
      "latitude": 26.1,
      "longitude": 87.9,
      "area": "Main Road",
      "shortDescription": "Tea, snacks and takeaway.",
      "imageUrl": "https://cdn.example.com/businesses/27/cover.webp"
    }
  ]
}
```

`entityType` is `business` or `place`; coordinates must be finite and within latitude `[-90, 90]` and longitude `[-180, 180]`. Exclude inactive records and records with missing/invalid coordinates. The `key` format must remain `business-{id}` / `place-{id}` because the UI uses it to preserve selection; opening a business navigates by ID, and opening a place by slug.

If a dedicated map endpoint is not desired, the backend can instead expose both public directories without pagination for map use, but the current place/business directory endpoints paginate. A dedicated map endpoint is therefore the simplest predictable contract.

## 7. Business field validation

Mirror these current client constraints on the server; server-side validation is authoritative.

| Field | Rule |
|---|---|
| `name` | Required, non-whitespace, max 150 characters. |
| `categoryId`, `categorySlug` | Required; must identify the same active category. |
| `subcategoryId`, `subcategorySlug` | Optional; if supplied, must identify the same active subcategory under the selected category. |
| `description` | Optional, max 1000 characters. |
| `phone` | Required, 7–20 characters, optional leading `+`, digits/spaces/parentheses/hyphens. |
| `whatsapp` | Optional, same phone format. |
| `email` | Optional valid email, max 254 characters. |
| `website` | Optional absolute `http`/`https` URL, max 300 characters. |
| `address` | Optional, max 300 characters. |
| `area` | Required, max 100 characters. |
| `landmark` | Optional, max 150 characters. |
| `pinCode` | Optional, exactly 6 digits. |
| `latitude`, `longitude` | Optional; valid coordinate ranges. Prefer requiring both or neither; update the frontend form validation to match before enforcing that pair rule. |
| `services` | Optional array, at most 30 entries, each max 80 characters. |
| `hours` | Optional weekday entries; open entries require both valid `HH:mm` times; closed entries have no times. |

The form currently permits selecting up to 8 local preview images, each JPEG/PNG/WebP and at most 5 MiB, but does **not** upload them or include them in create/update requests. Do not block business create/update waiting on an upload API. If upload is added, it needs a separate agreed multipart contract and UI wiring; returned business records can already expose `logoUrl`, `coverImageUrl`, `imageUrl`, and `images`.

## 8. Errors and access behavior

Use a consistent problem response. Prefer `application/problem+json` and include `code`; validation errors should identify form field paths:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "code": "VALIDATION_ERROR",
  "fieldErrors": [
    { "field": "phone", "code": "INVALID_FORMAT", "message": "Enter a valid phone number." }
  ]
}
```

Required status behavior:

| Status | Use |
|---|---|
| `400` | Malformed query/body, unsupported sort, invalid pagination, or field validation. |
| `401` | Missing/expired authentication for a protected endpoint. |
| `403` | Authenticated user lacks permission where the resource's existence is not being concealed. For owner records, `404` is preferred to avoid leaking existence. |
| `404` | Unknown resource; also inactive entity on public detail endpoints and another owner's private business. |
| `409` | Uniqueness conflict, e.g. duplicate account email, if applicable. |
| `500` | Unexpected backend failure; return a generic message and a trace/request ID, never stack details. |

## Frontend integration checklist

- Replace `BusinessRepository`, `PlaceRepository`, and static category sources with API-backed services.
- Connect query-string state to server pagination/filtering; preserve the existing names (`search`, `category`, `subcategory`, `area`, `sort`, `page`).
- Replace `MockCurrentUserService` with `/auth/me`; protect `/my/**` in the frontend, while enforcing auth/ownership on the server independently.
- Hydrate edit forms through `GET /my/businesses/{id}` so inactive owner listings remain editable.
- Handle loading, empty, validation, unauthorized, forbidden/not-found, and retry states explicitly.
- Keep business status server-controlled: creates are active immediately; ordinary edits preserve status.
- Ensure CORS and local backend startup are configured for the development URL above.

