# Base
FROM node:18-alpine

# Adds make dependencies for node-gyp
RUN apk add --no-cache curl make gcc g++ python3

# Installs pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Uses the node user
ENV USER=node

# Sets some PNPM variables up
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

# All subsequent commands are run as the "node" user.
USER "${USER}"

# Sets working directory
WORKDIR /usr/src/app

# Copies everything
COPY --chown=node . .

# Installs all dependencies
RUN pnpm install --frozen-lockfile

# Sets prisma up
RUN pnpm exec prisma generate

# Starts pnpm
CMD pnpm start
