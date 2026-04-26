# cPanel Frontend Deploy

Use the `frontend` folder as the Node.js application root in cPanel.

## What to set in cPanel

- Application root: `portfolio/frontend`
- Application startup file: `server.js`
- Node.js version: use a modern version supported by your host for Next.js 16

## Commands

Run these after setting environment variables:

```bash
npm install
npm run build
```

Then restart the Node.js app from cPanel.

This project uses `next build --webpack` for production builds.
Why: on some cPanel and CloudLinux environments, Next.js 16's default Turbopack build can fail with WebAssembly out-of-memory errors even when the app itself is valid.

## Required environment variables

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=https://smshagor.com
NEXT_PUBLIC_BACKEND_URL=https://smshagor.online
BACKEND_URL=https://smshagor.online
```

## Why this file exists

cPanel's Node.js app setup expects a startup file like `server.js` or `app.js`.
This project originally started the frontend with `next start`, which is a command, not a startup file.

`server.js` boots the Next.js app directly so cPanel can launch it as a standard Node process.

## Important backend note

`https://smshagor.online/health` working means the backend process is running.

`https://smshagor.online/api/site/home` returning `{"message":"Profile not found."}` means the backend database does not currently have the required `profile` row with `id = 1`.

Frontend deploy will not fix that response. You need backend data in the database for the homepage API to return content.
