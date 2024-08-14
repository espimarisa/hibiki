# Base
FROM oven/bun:alpine as base
WORKDIR /usr/src/app

# Installs to temp directory for caching purposes
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Installs to production
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# Copies from temp directory
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Tests & builds
ENV NODE_ENV=production
RUN bun run test
RUN bun run build

# Copies production dependencies and source into the final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .

# Runs
USER bun
ENTRYPOINT [ "bun", "run", "start" ]
