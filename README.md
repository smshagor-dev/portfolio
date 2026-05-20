# Developer Portfolio Workspace

A full-stack portfolio and admin workspace built as an npm workspaces monorepo.

This project combines a public-facing Next.js portfolio with an Express + Prisma backend, a MySQL database, real-time Socket.IO updates, an admin CMS, a live contact inbox, and AI-assisted reply tooling.

## Overview

- `frontend/`: Next.js 16 app for the public website and admin UI
- `backend/`: Express 5 API server with Prisma, MySQL, Socket.IO, auth, and admin APIs
- `public/`: shared root-level public assets
- `docker-compose.yml`: local container setup for frontend and backend

## Main Features

- Portfolio homepage with profile, skills, experience, education, achievements, counters, and social links
- Project, service, pricing, FAQ, testimonial, article, blog, research, review, and contact pages
- Admin dashboard for editing portfolio content and site settings
- Admin authentication with JWT and optional 2FA support
- Public comments and replies for projects, services, articles, and research publications
- Live contact ticket system with threaded replies and admin inbox
- Real-time updates with Socket.IO for comments, replies, content refresh, and contact conversations
- AI assistant endpoint and AI-backed contact reply workflow
- Admin notification center with grouped message notifications by conversation
- SEO utilities including sitemap, robots, metadata, GA/GTM hooks, and Google verification support
- SMTP/email integration, file uploads, reCAPTCHA, Telegram hooks, and browser notifications

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- Socket.IO client
- React Toastify
- Recharts
- CKEditor 5

### Backend

- Express 5
- Prisma ORM
- MySQL
- Socket.IO
- JWT auth
- Speakeasy for 2FA
- Nodemailer
- Multer

## Project Structure

```text
.
|-- backend/
|   |-- index.js
|   |-- lib/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- routes/
|   |   |-- admin.js
|   |   |-- assistant.js
|   |   |-- research.js
|   |   `-- site.js
|   |-- scripts/
|   `-- services/
|-- frontend/
|   |-- app/
|   |-- lib/
|   |-- public/
|   |-- utils/
|   |-- server.js
|   `-- next.config.js
|-- public/
|-- docker-compose.yml
|-- package.json
`-- VERCEL_DEPLOY.md
```

## Workspace Scripts

Run these from the repository root:

```bash
npm install
npm run dev
```

Available root scripts:

- `npm run dev`: run backend and frontend together
- `npm run dev:backend`: run only the backend
- `npm run dev:frontend`: run only the frontend
- `npm run build`: build the frontend
- `npm run start`: start backend and frontend in production mode
- `npm run lint`: run frontend lint
- `npm run vercel:link`: link the frontend project to Vercel
- `npm run vercel:pull`: pull Vercel environment config
- `npm run vercel:deploy`: deploy the frontend to Vercel

## Backend Scripts

Run these from `backend/` when needed:

- `npm run db:generate`: generate Prisma client
- `npm run db:migrate`: apply Prisma migrations
- `npm run db:seed`: seed the database
- `npm run db:prepare`: ensure database exists, generate client, apply migrations
- `npm run db:setup`: prepare and seed the database
- `npm run dev`: boot backend with DB setup and nodemon
- `npm run start`: production backend start

## Environment Setup

### Frontend env

Create `frontend/.env.local` from `frontend/.env.local.example` or use `frontend/.env` during local development.

Main frontend variables:

```env
NEXT_PUBLIC_GTM=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000
BACKEND_URL=http://127.0.0.1:5000
RECAPTCHA_SECRET_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GMAIL_PASSKEY=
EMAIL_ADDRESS=
```

### Backend env

Create `backend/.env` with values like:

```env
BACKEND_URL=http://127.0.0.1:5000
PORT=5000
FRONTEND_URL=http://localhost:3000
ADMIN_JWT_SECRET=replace-with-a-strong-random-secret
TWO_FACTOR_APP_NAME=Shagor Portfolio Admin
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio
DB_USER=root
DB_PASSWORD=root
GA4_PROPERTY_ID=
GA4_CLIENT_EMAIL=
GA4_PRIVATE_KEY=
```

Notes:

- Prisma uses `DATABASE_URL` internally through backend scripts. The repo builds it from the `DB_*` variables.
- `FRONTEND_URL` is also used as the allowed CORS origin list for API and Socket.IO access.
- Set a strong `ADMIN_JWT_SECRET` before any real deployment.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure env files

- Configure `backend/.env`
- Configure `frontend/.env.local` or update `frontend/.env`

### 3. Start MySQL

Make sure a MySQL server is running and the configured user can create/access the `portfolio` database.

### 4. Start the app

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:5000`

## Database

The schema lives in [backend/prisma/schema.prisma](/d:/project/Protfolio/backend/prisma/schema.prisma:1).

Major data areas include:

- Profile and portfolio content
- Skills, experience, education, achievements, stats
- Services and service comments/replies
- Projects and project comments/replies
- Pricing, FAQs, testimonials
- Articles, categories, comments, replies
- Research publications, comments, replies
- Contact tickets and threaded chat messages
- Admin users and AI provider settings
- Admin notifications

Seed data is defined in [backend/prisma/seed.js](/d:/project/Protfolio/backend/prisma/seed.js:1).

## API Layout

The backend mounts these route groups:

- `/api/site`: public site data, comments, contact flows, uploads, and public interactions
- `/api/admin`: admin auth, CMS, notifications, settings, content updates, inbox management
- `/api`: research and assistant endpoints

Key files:

- [backend/routes/site.js](/d:/project/Protfolio/backend/routes/site.js:1)
- [backend/routes/admin.js](/d:/project/Protfolio/backend/routes/admin.js:1)
- [backend/routes/research.js](/d:/project/Protfolio/backend/routes/research.js:1)
- [backend/routes/assistant.js](/d:/project/Protfolio/backend/routes/assistant.js:1)

## Real-Time Features

Socket.IO is configured in [backend/index.js](/d:/project/Protfolio/backend/index.js:1).

Live channels include:

- Project comments/replies
- Service comments/replies
- Article comments/replies
- Research comments/replies
- Testimonial updates
- Contact ticket visitor/admin rooms
- Admin message notifications
- Content refresh broadcasts

## Admin Area

The admin UI lives inside the Next.js app under [frontend/app/admin](/d:/project/Protfolio/frontend/app/admin/page.jsx:1).

It includes:

- Content management for portfolio sections
- Contact inbox and threaded replies
- Analytics and settings panels
- Article/research/service/project management
- Notification center
- AI-related settings and training data controls through backend models/routes

## AI and Contact Assistant

The assistant flow is powered from:

- [backend/services/contact-assistant.js](/d:/project/Protfolio/backend/services/contact-assistant.js:1)
- [backend/routes/assistant.js](/d:/project/Protfolio/backend/routes/assistant.js:1)

This supports:

- AI-generated assistant responses
- Admin-facing contact assistance
- Provider/model configuration through database settings

## Uploads and Static Files

- Backend uploads are served from `/uploads`
- Uploaded files are stored under `backend/public/uploads`
- The server also supports Google verification file serving through site settings

## Docker

You can run the frontend and backend with Docker Compose:

```bash
docker compose up --build
```

Configured container ports:

- Frontend: `http://localhost:3005`
- Backend: `http://localhost:5005`

See [docker-compose.yml](/d:/project/Protfolio/docker-compose.yml:1) for details.

## Vercel Deployment

The repo is a monorepo, but the Vercel deployment target is the `frontend` app.

Summary:

1. Import the repository into Vercel
2. Set the project Root Directory to `frontend`
3. Add production variables from `frontend/.env.vercel.example`
4. Keep the backend deployed separately

See [VERCEL_DEPLOY.md](/d:/project/Protfolio/VERCEL_DEPLOY.md:1) for the existing deployment flow.

## Notes

- The backend uses Express static file serving and CORS with configured frontend origins.
- The frontend uses a custom `server.js` for production start.
- `frontend/.env` currently contains local defaults; production values should stay in platform-managed env storage.
- Full frontend lint may currently surface unrelated existing repo issues outside the notification system.

## License

This repository does not currently declare a license. Add one if you plan to distribute or open-source the project.
