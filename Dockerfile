# Use Node.js 18 alpine image
FROM node:18-alpine

# Install necessary packages for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY contact-api/package*.json ./contact-api/
COPY package*.json ./

# Install root dependencies
RUN npm ci --production

# Install contact-api dependencies and copy build files
WORKDIR /app/contact-api
COPY contact-api/prisma ./prisma/
COPY contact-api/tsconfig.json ./
RUN npm ci

# Generate Prisma client with proper permissions
RUN npx prisma generate

# Copy the source code
COPY contact-api/src ./src/

# Build the application directly
RUN npx tsc -p .

# Clean up dev dependencies after build
RUN npm ci --production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]