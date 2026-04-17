# Google OAuth Page (PocketBase + React)

This frontend provides a simple OAuth page that signs users in with Google through PocketBase.

## Run locally

```bash
npm install
npm run dev
```

## Frontend environment

Create `.env` (or `.env.local`) in `frontend-web`:

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Backend requirements

PocketBase must have OAuth enabled for the `users` collection with Google credentials:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
```

The Google OAuth client should allow PocketBase callback URLs, typically:

- `http://127.0.0.1:8090/api/oauth2-redirect`
