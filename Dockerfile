FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

# Build TypeScript → JavaScript
RUN npm install -g tsx typescript && npm run build

CMD ["node", "dist/index.js"]