---
name: backend-dev-accelerator
description: Speeds up development in this NestJS backend by enforcing project-specific architecture, command flow, auth patterns, TypeORM/migration rules, and safe implementation checklists. Use when adding endpoints, modules, DTOs, entities, repositories, auth/roles logic, database changes, tests, or fixing backend bugs in this repository.
---

# Backend Dev Accelerator

## Goal

Implement features and fixes in this repository quickly while staying consistent with the existing NestJS + TypeORM architecture.

## Stack Snapshot

- NestJS 11 + TypeScript
- TypeORM + PostgreSQL
- JWT auth (access + refresh strategy)
- Global API prefix `api/v1`
- Global response interceptor and validation pipeline

## Repository Map

- `src/main.ts`: app bootstrap, CORS, Swagger, global guards/pipes/filters/interceptors
- `src/app.module.ts`: root module and TypeORM runtime config
- `src/config/*`: typed config for database/jwt/cookies/env
- `src/common/*`: shared guards, decorators, filters, interceptors, DTOs
- `src/modules/auth/*`: login/signup/refresh/logout flows
- `src/modules/users/*`: user entity/service/repository/roles
- `src/modules/airports/*`: example feature module with CRUD patterns
- `data-source.ts`: TypeORM CLI datasource for migrations

## Default Implementation Pattern

When building a new feature, follow this order:

1. Create/update DTOs in `src/modules/<feature>/dto`.
2. Create/update entity in `src/modules/<feature>/entities`.
3. Add repository methods in `src/modules/<feature>/<feature>.repository.ts`.
4. Add service logic in `src/modules/<feature>/<feature>.service.ts`.
5. Add controller routes in `src/modules/<feature>/<feature>.controller.ts`.
6. Register in module file `src/modules/<feature>/<feature>.module.ts`.
7. Wire module in `src/app.module.ts` if needed.
8. Add tests (service first, then controller/e2e).

## API Conventions To Keep

- Keep all routes under `/api/v1` (already global).
- Use DTO validation decorators (`class-validator`) for all request bodies/query params.
- Preserve response shape produced by `ResponseInterceptor`:
  - success/statusCode/message/data/timestamp envelope
- Keep error handling through Nest exceptions; global filter handles formatting.

## Auth + Authorization Rules

- For protected endpoints:
  - Use JWT auth guards consistently.
  - Use `@Roles(...)` and ensure role checks pass through `RolesGuard`.
- For refresh token flow:
  - Keep cookie-based refresh token behavior consistent with auth module and cookie config.
- Do not return sensitive fields (password, hashed refresh tokens) from DTO mappings.

## Database + Migration Guardrails

- Runtime config currently uses `synchronize: true` while migrations are also enabled.
- CLI datasource (`data-source.ts`) is the source for migration generation/run commands.
- Preferred safe flow for schema changes:
  1. Update entity.
  2. Generate migration.
  3. Review SQL diff.
  4. Run migration locally.
  5. Verify feature and tests.

Use commands:

```bash
npm run migration:generate -- src/migrations/<MigrationName>
npm run migration:run
npm run migration:revert
```

## Fast Dev Command Set

```bash
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

For backend iteration speed:

1. Run `npm run start:dev`.
2. After changes, run `npm run lint`.
3. Run targeted tests, then full `npm run test`.
4. Run `npm run build` before finalizing larger changes.

## Feature Delivery Checklist

Copy and track:

```text
- [ ] DTO validation added/updated
- [ ] Entity/repository/service/controller aligned
- [ ] Auth/roles applied (if endpoint is protected)
- [ ] No sensitive fields leaked in responses
- [ ] Migration generated/reviewed/run (if schema changed)
- [ ] Lint passes
- [ ] Tests added/updated and passing
- [ ] Build passes
```

## Testing Priorities

- Add unit tests near changed business logic first.
- Add/repair e2e tests for critical HTTP flows (auth and protected routes).
- If touching auth or database behavior, include regression tests for edge cases:
  - invalid token
  - expired token
  - role mismatch
  - duplicate/invalid data

## Known Project Risks (Handle Explicitly)

- `.env` currently carries sensitive-looking values: avoid exposing or committing secrets.
- Existing e2e scaffold may be outdated with current route prefixing.
- Airports module shows commented guard usage and debug logging in parts of the flow.
- Port defaults can differ between `.env`, docker, and datasource fallbacks; verify before DB debugging.

## Definition Of Done For This Repo

A change is complete only when:

1. Architecture pattern is preserved (DTO -> repo -> service -> controller).
2. Auth/role behavior is explicit and tested where relevant.
3. DB changes are migration-safe.
4. Lint/tests/build pass.
5. API behavior remains consistent with global interceptors/filters.
