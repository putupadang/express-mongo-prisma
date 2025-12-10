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

### RAG (Hugging Face)

- POST `/api/rag/query` `{ question: "..." }`
  - Builds context from stored users (name, email, createdAt), ranks with embeddings, and answers via HF chat completion.
  - Response shape: `{ answer, context, meta: { generationModel, embeddingModel, hits: [{ id, score }] } }`

Setup for AI:

1. Get a free personal token from https://huggingface.co/settings/tokens and set `HF_ACCESS_TOKEN` in `.env`.
2. Optional overrides:
   - `HF_GENERATION_MODEL` (default: `HuggingFaceH4/zephyr-7b-beta`)
   - `HF_EMBEDDING_MODEL` (default: `sentence-transformers/all-MiniLM-L6-v2`)

Example request:

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "List recent users"}'
```

## Notes

- This project is configured for Prisma v7 (requires Node 20.19+). The connection string is configured in `prisma.config.ts` as `datasource.url` (not in `schema.prisma`).
- The Prisma datasource in `schema.prisma` uses `provider = "mongodb"`.
- For MongoDB, `id` is a string with `@db.ObjectId`. Provide the hex string in routes.
