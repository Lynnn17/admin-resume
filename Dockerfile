FROM node:18-alpine AS builder

WORKDIR /app/resume-fe

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# === STAGE 2: Production ===
FROM node:18-alpine AS production

WORKDIR /app/resume-fe

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy env production
COPY --from=builder /app/resume-fe/.env.production ./.env.production

EXPOSE 6000
CMD ["npm", "run", "start", "--", "-p", "6000"]