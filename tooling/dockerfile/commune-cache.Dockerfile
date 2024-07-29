FROM node:18-slim AS base
RUN apt-get update
RUN apt-get install -y libc6-dev
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ARG APP_NAME=commune-cache

FROM base AS builder
RUN pnpm add -g	"turbo@^2.0.3"
COPY . ./build
WORKDIR /build
RUN turbo prune ${APP_NAME} --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /build/out/json/ .
COPY --from=builder /build/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile
# Build the project
COPY --from=builder /build/out/full/ .
RUN pnpm dlx turbo run build -F ${APP_NAME}


FROM base as runner
WORKDIR /app

COPY --from=builder /build/out/full .

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer /app/apps/${APP_NAME}/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nodejs:nodejs /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist

EXPOSE 3000

# CMD ["turbo", "start", "-F", "commune-cache"]
CMD node ./apps/${APP_NAME}/index.js