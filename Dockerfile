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
# VITE_API_BASE_URL and VITE_API_URL are injected at build time in production.
# Setting VITE_API_URL to empty so axiosClient uses relative paths (/api/...),
# which nginx then proxies to the backend — avoids the /api/api double-prefix.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
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
