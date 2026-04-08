# FluxCart Next.js

FluxCart is a Next.js 16 monolith for an e-commerce backend portfolio project. The app currently expects PostgreSQL for persistence and Redis for caching.

## Development Services

The repository includes a local Docker Compose stack in `compose.yaml` with:

- PostgreSQL `17`
- Redis `8.6-alpine`

These versions were chosen to match the latest stable major/minor lines at the time of setup on April 8, 2026.

## Local Setup

1. Create local env values if you do not already have them:

```bash
cp .env.example .env
```

2. Start development services:

```bash
docker compose up -d
```

3. Apply Prisma migrations:

```bash
npx prisma migrate dev
```

4. Start the app:

```bash
npm run dev
```

## Expected Environment Variables

```bash
DATABASE_URL=postgresql://fluxcart:fluxcart@localhost:5432/fluxcart?schema=public
REDIS_URL=redis://localhost:6379
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

## Useful Commands

Start services:

```bash
docker compose up -d
```

Stop services:

```bash
docker compose down
```

Stop services and remove volumes:

```bash
docker compose down -v
```

View service logs:

```bash
docker compose logs -f postgres redis
```
