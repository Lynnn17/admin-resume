# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app/resume-fe

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app/resume-fe
COPY --from=deps /app/resume-fe/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app/resume-fe

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/resume-fe/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/resume-fe/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/resume-fe/.next/static ./.next/static

USER nextjs

EXPOSE 6000

ENV PORT=6000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
