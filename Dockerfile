# ── Stage 1 : Build du frontend (Vite → back/public/) ────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /workspace
COPY front/ ./front/
RUN mkdir -p ./back/public
WORKDIR /workspace/front
RUN npm ci && npm run build

# ── Stage 2 : Build du backend (AdonisJS → build/) ───────────────────────────
FROM node:22-alpine AS backend
WORKDIR /workspace/back
COPY back/ ./
# Injecte les assets SPA compilés par Vite
COPY --from=frontend /workspace/back/public ./public
RUN npm ci && node ace build

# ── Stage 3 : Image de production ────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

COPY --from=backend /workspace/back/build ./
RUN npm ci --omit=dev

# Dossiers de stockage persistants (montés via volumes Docker)
RUN mkdir -p public/covers public/audio storage/wave storage/archives

EXPOSE 3333

# Lance les migrations puis démarre le serveur
CMD ["sh", "-c", "node ace.js migration:run --force && node bin/server.js"]
