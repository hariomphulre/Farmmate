FROM node:22-alpine AS production

# Install dumb-init for proper signal handling and PID 1 management
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline && npm cache clean --force

# Copy application source
COPY . .

# Create runtime directories that are NOT mounted as volumes
RUN mkdir -p crop_imgs/disease detect_results/disease field_corrdinates Field_co-ordinates

# Use the non-root 'node' user for security
RUN chown -R node:node /app
USER node

EXPOSE 5000

# Health-check: ping the /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5000/health || exit 1

# dumb-init reaps zombie processes and forwards signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.cjs"]