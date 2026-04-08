# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js 16 App Router entrypoints, grouped by route segments such as `(storefront)`, `(auth)`, and `(admin)`, plus API handlers under `app/api/*`. Reusable UI lives in `components/`, with shadcn-style primitives in `components/ui/`. Core business logic sits in `lib/`: use `lib/modules/*` for domain services and schemas, `lib/auth/` for authentication, and shared helpers such as `lib/db.ts`, `lib/redis.ts`, and `lib/logger.ts` for infrastructure. Prisma schema and migrations are in `prisma/`. Long-form project notes live in `docs/`.

## Build, Test, and Development Commands
Run `docker compose up -d` to start PostgreSQL and Redis from `compose.yaml`. Use `npm run dev` for the Turbopack dev server, `npm run build` for a production build, and `npm run start` to serve the built app. Quality checks are `npm run lint`, `npm run typecheck`, and `npm run format`. Database changes should go through Prisma, for example `npx prisma migrate dev`.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode and the `@/*` import alias from `tsconfig.json`. Follow the existing style: 2-space indentation, double quotes, and semicolons. Prefer server-first Next.js patterns in `app/`, keep route files named `page.tsx`, `layout.tsx`, or `route.ts`, and use kebab-case for component filenames like `add-to-cart-button.tsx`. Keep domain code grouped by feature in `lib/modules/<domain>/`.

## Testing Guidelines
There is no committed Jest, Vitest, or Playwright setup yet. Until a test runner is added, treat `npm run lint`, `npm run typecheck`, and `npm run build` as the minimum validation before opening a PR. When adding tests later, keep them close to the feature or in a dedicated `tests/` folder, and use `*.test.ts` or `*.spec.ts` naming.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit subjects such as `Refactor cart state to use SWR` and `Fix cart clearing after checkout`. Keep commits focused and descriptive. PRs should include a concise summary, linked issue or task when available, any Prisma or env changes, and screenshots for UI changes affecting storefront, auth, or admin screens.

## Security & Configuration Tips
Do not commit populated `.env` files. Start from `.env.example`, keep secrets local, and document new variables in both `.env.example` and `README.md`.
