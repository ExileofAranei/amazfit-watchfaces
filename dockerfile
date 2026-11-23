# Reproducible toolchain: Node 24 + project deps (Zeus CLI is a dev dependency).
# Source is bind-mounted at run time; node_modules live in a named volume.
FROM node:24.16.0-bookworm-slim
WORKDIR /work
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
# Zeus keeps its login under ~/.zepp — persisted via the `zepp-auth` volume (see compose.yaml)
RUN mkdir -p /home/node/.zepp && chown node:node /home/node/.zepp
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/tooling/package.json packages/tooling/
COPY faces/segment/package.json faces/segment/
COPY faces/nothing/package.json faces/nothing/
COPY faces/segue/package.json faces/segue/
RUN npm ci --no-audit --no-fund && chown -R node:node /work
USER node
