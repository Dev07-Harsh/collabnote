# client/Dockerfile

# ——— Build stage ———
FROM node:20-alpine AS builder

# 1. Accept the API URL as a build‑time argument
ARG VITE_API_URL
# 2. Expose it to Vite’s import.meta.env
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /usr/src/app

# 3. Copy manifest, Vite config, and index.html
COPY package.json package-lock.json vite.config.js index.html ./

# 4. Copy static assets and source
COPY public  ./public
COPY src     ./src

# 5. Install & build
RUN npm ci
RUN npm run build

# ——— Serve stage ———
FROM nginx:stable-alpine

# 6. Clear default nginx content
RUN rm -rf /usr/share/nginx/html/*

# 7. Copy build output from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
