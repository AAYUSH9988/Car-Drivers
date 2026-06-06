FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN rm -rf .env.example assets/drivers assets/vehicles

FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

COPY --from=base --chown=nodeuser:nodejs /app .

USER nodeuser

EXPOSE 4000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health',(r)=>process.exit(r.statusCode===200?0:1))"

CMD ["node", "server.js"]
