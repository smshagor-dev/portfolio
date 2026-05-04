# Vercel Deploy

This repository is an npm workspace monorepo. Deploy the `frontend` app as the Vercel project root.

## One-time setup

1. In Vercel, create or import the project from this repository.
2. Set the project's Root Directory to `frontend`.
3. Add the production environment variables from [frontend/.env.vercel.example](/d:/project/Protfolio/frontend/.env.vercel.example:1).

## CLI flow

Run these commands from the repository root:

```bash
npm run vercel:link
npm run vercel:pull
npm run vercel:deploy
```

## Notes

- `BACKEND_URL` should stay public on Vercel, for example `https://smshagor.online`.
- `NEXT_PUBLIC_APP_URL` should match the production frontend domain.
- The backend stays outside Vercel in the current architecture.
