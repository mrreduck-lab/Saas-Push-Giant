FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/scheduler/package.json apps/scheduler/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sdk/package.json packages/sdk/package.json
RUN npm ci --workspaces --include-workspace-root

COPY tsconfig.platform.json ./
COPY packages/shared packages/shared
COPY apps/worker apps/worker
RUN npm run build -w @pushgiant/shared && npm run build -w @pushgiant/worker

CMD ["npm", "run", "start", "-w", "@pushgiant/worker"]
