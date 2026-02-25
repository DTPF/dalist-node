# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dalist is a wishlist management REST API built with Express.js and MongoDB. Users authenticate via Auth0 (JWT/JWKS), then create and manage wishlists with items. The frontend (React, separate repo) is served as static files in production.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Development server with nodemon (port 4000)
pnpm start            # Production server (port 4004)
pnpm run format       # Run prettier on src/
```

No test suite is configured.

## Architecture

Standard Express MVC layout under `src/`:

- **index.js** - Entry point: connects to MongoDB via Mongoose, starts Express server
- **app.js** - Express app setup: middleware (helmet, CORS, body-parser), route mounting, production static file serving
- **config/config.js** - Environment-aware config; loads `.env.development` or `.env.production` based on `NODE_ENV`
- **models/** - Mongoose schemas: `User` (profile, UI prefs, Auth0 ID) and `Wishlist` (items array with positions)
- **controllers/** - Request handlers with async/await, try-catch, `.lean().exec()` for queries
- **routers/** - Route definitions; all endpoints require `md_auth.checkJwt` (Auth0 JWT validation)
- **middlewares/auth.middleware.js** - JWT verification via `express-jwt` + `jwks-rsa` with JWKS caching
- **middlewares/error.middleware.js** - Catches `UnauthorizedError`, returns 401 with Spanish messages

All API routes are mounted at `/api/v1/` and protected by Auth0 JWT authentication.

## Configuration

Environment variables loaded from `.env.development` or `.env.production` (see `.env.*.example` templates):
`API_VERSION`, `IP_SERVER`, `PORT_SERVER`, `PORT_MONGO_DB`, `DB_NAME`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`, `AUTH0_SECRET`

## Code Conventions

- CommonJS modules (`require`/`module.exports`)
- Prettier config in package.json: single quotes, trailing commas (es5), 110 char width, 2-space indent
- Controller response pattern: `{ status, message }` or `{ status, message, error }` with appropriate HTTP codes
- MongoDB operators (`$set`, `$push`, `$pull`) for subdocument/array mutations
