# -------- Stage 1: Build --------
FROM node:22 AS builder

WORKDIR /app

# Install dependencies (including dev for TypeScript build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript -> dist/
RUN npm run build


# -------- Stage 2: Production --------
FROM node:22

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/index.js"]