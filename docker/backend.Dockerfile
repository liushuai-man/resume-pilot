FROM node:20-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY backend/ ./
RUN pnpm prisma:generate && pnpm build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
