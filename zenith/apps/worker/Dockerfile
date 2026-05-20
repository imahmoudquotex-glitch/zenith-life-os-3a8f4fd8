FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/audit/package.json ./packages/audit/
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/worker ./apps/worker
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY packages/audit ./packages/audit

ENV NODE_ENV=production
CMD ["node", "--import", "tsx/esm", "apps/worker/src/index.ts"]
