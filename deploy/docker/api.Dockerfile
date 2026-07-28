FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/scheduler/package.json apps/scheduler/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspaces --include-workspace-root

COPY tsconfig.platform.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
COPY migrations migrations
RUN npm run build -w @pushgiant/shared && npm run build -w @pushgiant/api

CMD ["npm", "run", "start", "-w", "@pushgiant/api"]
