# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dalist backend is a wishlist management REST API built with Express.js (Node.js) and MongoDB. Users authenticate via Auth0 (JWT/JWKS), then create and manage wishlists with items. The frontend (React, separate repo at `DTPF/dalist-react`) is served as static files from `client/` in production mode.

**Language:** JavaScript (CommonJS modules — `require`/`module.exports`)
**Package manager:** pnpm

## Commands

```bash
pnpm db               # Start MongoDB Docker container (dalist-mongodb, required)
pnpm install          # Install dependencies
pnpm dev              # Development server with nodemon (port 4000, NODE_ENV=development)
pnpm start            # Production server (port 4004, NODE_ENV=production)
pnpm format           # Run Prettier on src/
```

No test suite is configured.

## Architecture

Standard Express MVC layout under `src/`:

```
src/
  index.js                  # Entry point: connects to MongoDB via Mongoose, starts server
  app.js                    # Express app: middleware chain, route mounting, production static serving
  config/
    config.js               # Environment-aware config (reads .env.development or .env.production)
  models/
    user.model.js           # User schema: profile, UI prefs (colors, language), Auth0 ID
    wishlist.model.js        # Wishlist schema: name, colors, position, wishlistItems array
  controllers/
    user.controller.js      # User CRUD: init/get, update profile, change language/colors/direction
    wishlist.controller.js  # Wishlist CRUD: create, get, update, delete wishlists and items
  routers/
    user.router.js          # User routes — all require Auth0 JWT
    wishlist.router.js      # Wishlist routes — all require Auth0 JWT
  middlewares/
    auth.middleware.js       # JWT verification via express-jwt + jwks-rsa (RS256, JWKS caching)
    error.middleware.js      # Catches UnauthorizedError, returns 401 with Spanish messages
```

All API routes are mounted at `/api/v1/` and protected by Auth0 JWT authentication.

## API Endpoints

All endpoints are prefixed with `/api/v1` and require a valid Auth0 JWT Bearer token.

### User Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/init-get-user` | Get or create user from Auth0 token (upsert) |
| PUT | `/update-user/:userId` | Update user profile by MongoDB `_id` |
| PUT | `/change-language` | Update user language preference |
| PUT | `/update-app-color` | Update app theme colors (colorPrimary, colorPrimaryBg) |
| PUT | `/update-wishlist-color` | Update default wishlist colors |
| PUT | `/change-wishlists-direction` | Change wishlists sort direction (asc/desc) |

### Wishlist Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/get-wishlists-by-user-id` | Get all wishlists for authenticated user (sorted by updatedAt desc) |
| GET | `/get-wishlist-by-id/:wishlistId/:userId` | Get single wishlist and update user's current wishlist |
| POST | `/post-new-wishlist` | Create new wishlist |
| POST | `/post-new-wishlist-item/:wishlistId` | Add item to wishlist (UUID-based item IDs) |
| PUT | `/update-wishlist/:wishlistId` | Update wishlist metadata |
| PUT | `/update-wishlist-item/:wishlistId/:wishlistItemId` | Update item (title, isCompleted, position) |
| PUT | `/change-wishlist-color/:wishlistId` | Change wishlist colors |
| DELETE | `/remove-wishlist-item/:wishlistId/:wishlistItemId` | Remove item from wishlist |
| DELETE | `/remove-wishlist/:wishlistId` | Delete entire wishlist |

## Data Models

### User
- `userId` (String, unique) — Auth0 subject ID
- `email`, `name`, `lastname` (String)
- `wishlistsInfo` — `{ currentWishlist, wishlistsOrder, wishlistsDirection }`
- `appInfo` — `{ language, colorPrimary, colorPrimaryBg, wishlistColor, wishlistColorBg }`
- Timestamps enabled (createdAt, updatedAt)

### Wishlist
- `userId` (String) — Auth0 subject ID
- `wishlistName` (String)
- `backgroundColor`, `color` (String) — hex colors
- `position` (Number)
- `wishlistItems` (Array) — each item: `{ id (UUID), title, description, isCompleted, position }`
- Timestamps enabled (createdAt, updatedAt)

## Configuration

Environment variables loaded from `.env.development` or `.env.production` (see `.env.*.example` templates):

| Variable | Description | Dev Default |
|----------|-------------|-------------|
| `API_VERSION` | API version prefix | `v1` |
| `IP_SERVER` | Server hostname | `localhost` |
| `PORT_SERVER` | Express server port | `4000` (dev), `4004` (prod) |
| `PORT_MONGO_DB` | MongoDB port | `27017` |
| `DB_NAME` | MongoDB database name | — |
| `AUTH0_AUDIENCE` | Auth0 API audience | — |
| `AUTH0_ISSUER` | Auth0 issuer URL (with trailing `/`) | — |
| `AUTH0_SECRET` | Auth0 secret (in example, not used in code) | — |
| `DB_USER_PASSWORD` | MongoDB auth (production only) | — |

## Code Conventions

- CommonJS modules (`require`/`module.exports`)
- Prettier config in package.json: single quotes, trailing commas (es5), 110 char width, 2-space indent
- Controller response pattern: `{ status, message }` or `{ status, message, error }` with appropriate HTTP codes
- MongoDB operators (`$set`, `$push`, `$pull`) for subdocument/array mutations
- `.lean().exec()` on read queries for plain JavaScript objects
- camelCase for variables/functions, kebab-case for URL path segments
- Error messages in Spanish (e.g., "No estas autorizado", "Error del servidor")
- CORS configured for `dalist.dtpf.es` and `http://localhost:3000`

## Known Issues

- `app.js` uses `path` in the production static-serving block but does not `require('path')` — this would fail in production mode if triggered. The production deployment (dalist-production) has the same codebase and likely has this issue as well.
- `postNewWishlist` in `wishlist.controller.js` counts ALL wishlists (not just the user's) to determine position.
