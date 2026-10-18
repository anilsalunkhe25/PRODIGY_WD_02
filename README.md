# People — Employee Management

A responsive employee directory with a React interface and a protected Express + MongoDB API. Administrators can sign in, search and filter teammates, add or edit employee records, remove employees, and export the current directory as CSV.

## Requirements

- Node.js 18+
- MongoDB (local or hosted)

## Run locally

1. Install dependencies with `npm install`.
2. Copy the project-root `.env.example` to a project-root `.env` and set `MONGODB_URI` and a `JWT_SECRET` of at least 32 characters. Set a strong `ADMIN_PASSWORD` of at least 12 characters. The API and admin seed command load this root `.env` even when run from the `server` directory.
3. Create the first admin account with `npm run seed:admin`.
4. Start the client and API with `npm run dev`.
5. Open `http://localhost:5173` and sign in with the configured admin email and password.

The Vite development server proxies `/api` requests to `http://localhost:5000`. For a different API origin, configure the proxy in `vite.config.js` and set `CLIENT_ORIGIN` in `.env`.

## Security and validation

- There is no public registration route. Admin accounts are provisioned using the seed command.
- Passwords are stored as bcrypt hashes; login issues an eight-hour JWT held in browser session storage.
- Employee endpoints require a valid bearer token. Login requests are rate-limited, and Helmet sets standard security headers.
- Employee request bodies are validated on the server; email addresses are normalized and unique, and malformed or duplicate records return explicit errors.

## Production build

Run `npm run build` to create the static frontend in `dist/`. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` in the production environment, then start the API with `npm start`. Serve the built frontend from a static host configured to route `/api` to the API server.
