# Stage 1: install deps — shared by dev and builder
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts ./
RUN npm ci

# Stage 2: production build
FROM deps AS builder
COPY . .
# VITE_API_BASE_URL is injected at build time in production
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 3: serve production build via nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# React Router needs all routes to fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]
