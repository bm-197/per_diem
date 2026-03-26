FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development target — hot reload, no build step
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# Production build
FROM deps AS builder
COPY . .
RUN pnpm build

# Production target — optimized standalone output
FROM base AS prod
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
