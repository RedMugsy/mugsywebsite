FROM node:18-bullseye-slim

WORKDIR /app

# Keep debian packages lean and install dependencies Prisma needs
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Provide defaults for build-time Prisma needs; Railway runtime values override these
ARG DATABASE_URL=file:./data/dev.db
ENV DATABASE_URL=$DATABASE_URL

# Ensure dev dependencies stay available during the build even when NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=false

# Copy manifests and Prisma schema from contact-api subdirectory
COPY contact-api/package*.json ./
COPY contact-api/prisma ./prisma/
# Install dependencies (includes dev deps because of NPM_CONFIG_PRODUCTION=false)
RUN npm ci --verbose

# Copy application source from contact-api subdirectory
COPY contact-api/tsconfig.json ./
COPY contact-api/src ./src/

# Copy public directory from repo root
COPY public ./public/

# Compile TypeScript (runs prisma generate as part of the build script)
RUN npm run build

# Ensure the SQLite directory exists for DATABASE_URL=file:./data/...
RUN mkdir -p ./data

ENV NODE_ENV=production

EXPOSE 8787

CMD ["npm", "start"]

