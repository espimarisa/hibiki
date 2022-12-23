# Use Alpine as a base
FROM node:alpine

# Adds make dependencies for node-gyp
RUN apk add --no-cache curl make gcc g++ python3

# Uses the node user
ENV USER=node

# Sets our path to the node global bin
ENV PATH="/home/node/.npm-global/bin:${PATH}"

# Sets the global install directory
ENV NPM_CONFIG_PREFIX="/home/node/.npm-global"

# All subsequent commands are run as the `node` user.
USER "${USER}"

# # Pre-create the target dir for global install.
# RUN mkdir -p "${NPM_CONFIG_PREFIX}/lib"

# Sets working directory
WORKDIR /usr/src/app

# Copies everything
COPY --chown=node . .

# Installs pnpm and dependencies
RUN npm i -g pnpm && pnpm install

# Exposes the webserver port
EXPOSE 4000

# Starts Hibiki
CMD pnpm start
