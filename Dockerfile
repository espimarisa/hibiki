# Use the official bun:alpine image.
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# Installs all dependencies into the temp directory.
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Installs production dependencies into the temp directory.
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copies cached node_modules and all project files into the image.
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Copies production dependencies and the source into the final image.
FROM base AS release
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/drizzle ./drizzle
COPY --from=builder /usr/src/app/locales ./locales
COPY --from=builder /usr/src/app/drizzle.config.ts ./
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./

# Creates the logs directory.
RUN mkdir -p /usr/src/app/logs
RUN chown bun:bun /usr/src/app/logs
USER bun

# Starts the application.
ENV NODE_ENV=PRODUCTION
ENTRYPOINT ["bun", "run", "deploy"]
