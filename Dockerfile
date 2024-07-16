FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN npm install -g "turbo@^2.0.3"


FROM base AS builder

ARG APP_NAME=sample-app

COPY . /build
WORKDIR /build

# Install dependencies
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store  pnpm install --frozen-lockfile

RUN turbo prune ${APP_NAME} --docker


FROM base AS app

WORKDIR /app

COPY --from=builder  /build/out/full/ .
COPY --from=builder  /build/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile
RUN pnpm run build

WORKDIR /app/apps/${APP_NAME}

EXPOSE 8000

# TODO: fix
CMD [ "pnpm", "run", "start" ]
