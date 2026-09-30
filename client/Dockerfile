# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build the React app
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (layer-cache friendly)
COPY package*.json ./
RUN npm ci --prefer-offline

# Public runtime config is injected at build time so Vite can inline it.
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GROQ_API_KEY
ARG VITE_GROQ_API_URL
ARG VITE_DATA_GOV_API_KEY

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY
ENV VITE_GROQ_API_URL=$VITE_GROQ_API_URL
ENV VITE_DATA_GOV_API_KEY=$VITE_DATA_GOV_API_KEY

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
