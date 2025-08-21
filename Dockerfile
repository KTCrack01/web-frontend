# 멀티 스테이지 빌드를 사용하여 이미지 크기 최적화
FROM node:18-alpine AS base

# 의존성 설치 단계
FROM base AS deps
# pnpm 설치 확인
RUN corepack enable

WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml* ./

# 의존성 설치
RUN pnpm install --no-frozen-lockfile

# 빌드 단계
FROM base AS builder
RUN corepack enable

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드
RUN pnpm build

# 프로덕션 단계
FROM base AS runner
RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

# 시스템 사용자 생성 (보안상 권장)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 애플리케이션 복사
COPY --from=builder /app/public ./public

# Next.js 정적 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# 포트 노출
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]
