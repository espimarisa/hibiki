# Use Bun's official Alpine image as the base.
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=PRODUCTION

# Installs all dependencies.
FROM base AS install_deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --verbose

# Copies node_modules to the builder.
FROM base AS builder
COPY . .
COPY --from=install_deps /usr/src/app/node_modules ./node_modules
RUN bun run build

# Installs production dependencies.
FROM base AS final
ENV NODE_ENV=PRODUCTION
WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --verbose

# Copies required files from the builder to the final image.
COPY --from=builder /usr/src/app/dist/ ./
COPY --from=builder /usr/src/app/drizzle ./drizzle
COPY --from=builder /usr/src/app/drizzle.config.ts ./
COPY --from=builder /usr/src/app/locales ./locales
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./

# Creates the logs directory and takes ownership of it.
RUN mkdir -p /usr/src/app/logs && chown bun:bun /usr/src/app/logs
USER bun

# Runs the application.
ENTRYPOINT ["bun", "run", "deploy"]
