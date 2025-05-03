# 1. Use a lightweight Node base image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package manifest and install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 4. Copy the rest of the source
COPY . .

# 5. Expose port your app listens on
EXPOSE 5000

# 6. Default command to start the server
CMD ["node", "server.js"]
