FROM node:18-alpine

WORKDIR /app

# Copy contact-api files
COPY contact-api/package*.json ./
COPY contact-api/prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY contact-api/ .

# Build
RUN npm run build

# Start
EXPOSE 8787
CMD ["npm", "start"]