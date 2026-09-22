# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build the React app
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (layer-cache friendly)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Serve with Nginx (tiny final image ~25 MB)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy SPA-aware Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx runs in foreground by default when launched with CMD
CMD ["nginx", "-g", "daemon off;"]
