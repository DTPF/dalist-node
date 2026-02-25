# Dalist Backend

REST API for the Dalist wishlist management application. Built with Node.js, Express.js, and MongoDB. Handles user profiles, wishlists, and wishlist items with Auth0 JWT authentication.

**Live:** [https://dalist.dtpf.es](https://dalist.dtpf.es)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4
- **Database:** MongoDB with Mongoose 7 ODM
- **Authentication:** Auth0 JWT (RS256) via `express-jwt` + `jwks-rsa`
- **Security:** Helmet (CSP), CORS
- **Language:** JavaScript (CommonJS)

## Prerequisites

- Node.js (v18+)
- pnpm
- MongoDB instance running locally (or accessible remotely)
- Auth0 account with API configured

## Installation

```bash
git clone https://github.com/DTPF/dalist-node.git
cd dalist-node
pnpm install
```

## Configuration

Copy the environment example file and configure it:

```bash
cp .env.development.example .env.development
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `API_VERSION` | API version prefix (e.g., `v1`) |
| `IP_SERVER` | Server hostname (e.g., `localhost`) |
| `PORT_SERVER` | Express server port (e.g., `4000`) |
| `PORT_MONGO_DB` | MongoDB port (e.g., `27017`) |
| `DB_NAME` | MongoDB database name |
| `AUTH0_AUDIENCE` | Auth0 API audience identifier |
| `AUTH0_ISSUER` | Auth0 tenant issuer URL (with trailing `/`) |
| `AUTH0_SECRET` | Auth0 client secret |

For production, copy and configure `.env.production.example` to `.env.production`.

## Available Scripts

```bash
pnpm dev              # Start dev server with nodemon (NODE_ENV=development)
pnpm start            # Start production server (NODE_ENV=production)
pnpm format           # Format source files with Prettier
```

## Project Structure

```
src/
  index.js                    # Entry point: MongoDB connection + server start
  app.js                      # Express app: middleware, routes, static serving
  config/
    config.js                 # Environment-aware configuration loader
  models/
    user.model.js             # User Mongoose schema
    wishlist.model.js          # Wishlist Mongoose schema
  controllers/
    user.controller.js        # User request handlers
    wishlist.controller.js    # Wishlist request handlers
  routers/
    user.router.js            # User route definitions
    wishlist.router.js        # Wishlist route definitions
  middlewares/
    auth.middleware.js         # Auth0 JWT validation middleware
    error.middleware.js        # Error handling middleware
```

## API Endpoints

All endpoints are prefixed with `/api/v1` and require a valid Auth0 JWT Bearer token in the `Authorization` header.

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/init-get-user` | Initialize or retrieve user from Auth0 token |
| PUT | `/api/v1/update-user/:userId` | Update user profile |
| PUT | `/api/v1/change-language` | Update language preference |
| PUT | `/api/v1/update-app-color` | Update app theme colors |
| PUT | `/api/v1/update-wishlist-color` | Update default wishlist colors |
| PUT | `/api/v1/change-wishlists-direction` | Change wishlists sort direction |

### Wishlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/get-wishlists-by-user-id` | Get all wishlists for the authenticated user |
| GET | `/api/v1/get-wishlist-by-id/:wishlistId/:userId` | Get a single wishlist by ID |
| POST | `/api/v1/post-new-wishlist` | Create a new wishlist |
| POST | `/api/v1/post-new-wishlist-item/:wishlistId` | Add an item to a wishlist |
| PUT | `/api/v1/update-wishlist/:wishlistId` | Update wishlist metadata |
| PUT | `/api/v1/update-wishlist-item/:wishlistId/:wishlistItemId` | Update a wishlist item |
| PUT | `/api/v1/change-wishlist-color/:wishlistId` | Change wishlist colors |
| DELETE | `/api/v1/remove-wishlist-item/:wishlistId/:wishlistItemId` | Remove an item from a wishlist |
| DELETE | `/api/v1/remove-wishlist/:wishlistId` | Delete an entire wishlist |

## Production Mode

In production (`NODE_ENV=production`), the server also serves the pre-built React frontend from a `client/` directory as static files with SPA catch-all routing. The production deployment is managed in the separate [dalist-production](https://github.com/DTPF/dalist-production) repository.

## License

MIT
