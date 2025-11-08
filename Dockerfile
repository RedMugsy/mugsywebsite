# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from contact-api directory
COPY contact-api/package*.json ./
COPY contact-api/prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code from contact-api directory
COPY contact-api/ .

# Generate Prisma client and build TypeScript
RUN npx prisma generate && npm run build

# Create database directory
RUN mkdir -p /app/prisma

# Expose port
EXPOSE 8787

# Start command
CMD ["npm", "start"]
