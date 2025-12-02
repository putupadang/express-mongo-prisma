# Express + MongoDB (Prisma) Starter

Plain Express.js project using Prisma ORM with the MongoDB connector.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. Copy env file
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set `DATABASE_URL` to your MongoDB connection string.

3. Install dependencies

   ```bash
   npm install
   ```

4. Generate Prisma Client

   ```bash
   npm run prisma:generate
   ```

5. Push schema to MongoDB (no SQL migrations for MongoDB)

   ```bash
   npm run db:push
   ```

6. Start the dev server
   ```bash
   npm run dev
   ```

Server runs at http://localhost:3000

## API

- GET `/health` -> `{ status: 'ok' }`
- Users
  - GET `/api/users`
  - GET `/api/users/:id`
  - POST `/api/users` `{ email, name? }`
  - PUT `/api/users/:id` `{ email?, name? }`
  - DELETE `/api/users/:id`

## Notes

- This project is configured for Prisma v7 (requires Node 20.19+). The connection string is configured in `prisma.config.ts` as `datasource.url` (not in `schema.prisma`).
- The Prisma datasource in `schema.prisma` uses `provider = "mongodb"`.
- For MongoDB, `id` is a string with `@db.ObjectId`. Provide the hex string in routes.
