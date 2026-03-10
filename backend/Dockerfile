# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src/ ./src/
RUN npm run build && mkdir -p dist/data && cp src/data/airports.dat dist/data/airports.dat

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js"]
