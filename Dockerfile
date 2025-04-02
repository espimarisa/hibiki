# Base image on bun:alpine
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# Installs all dependencies to the temp directory for caching
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile --verbose

# Installs production dependencies to the temp directory for caching
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production --verbose

# Copy from the temp directory; copy non-ignored files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Run unit tests
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# Copy production dependencies and source into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/ .

# Create the logs directory and change ownership
RUN mkdir -p /usr/src/app/logs
RUN chown bun /usr/src/app/logs

# Change user to the bun user
USER bun

# Run deploy script
RUN bun run register

# Start the bot
ENTRYPOINT ["bun", "run", "start"]
