FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY contact-api/package*.json ./

# Install dependencies
RUN npm ci --verbose

# Copy prisma schema
COPY contact-api/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY contact-api/src ./src/
COPY contact-api/tsconfig.json ./
COPY contact-api/public ./public/

# Build TypeScript
RUN npm run build

# Create database directory
RUN mkdir -p ./prisma

# Expose port
EXPOSE 8787

# Start command
CMD ["npm", "start"]