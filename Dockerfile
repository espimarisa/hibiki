# Base
FROM node:20-alpine

# Adds make dependencies for node-gyp
RUN apk add --no-cache curl make gcc g++ python3

# Installs pnpm
RUN corepack enable pnpm

# Uses the node user
ENV USER=node

# All subsequent commands are run as the "node" user.
USER "${USER}"

# Sets working directory
WORKDIR /usr/src/app

# Copies everything
COPY --chown=node . .

# Installs all dependencies
RUN pnpm install --frozen-lockfile

# Starts pnpm
CMD pnpm start
