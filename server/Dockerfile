FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --omit=dev || yarn install --production || true
COPY . .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.js"]

