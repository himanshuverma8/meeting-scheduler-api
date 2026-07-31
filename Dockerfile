# ---- Stage 1: build ----
# Needs the full dependency tree (typescript, etc.) to compile src/ -> dist/
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---- Stage 2: runtime ----
# Fresh, minimal image: only production deps + the compiled output
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
