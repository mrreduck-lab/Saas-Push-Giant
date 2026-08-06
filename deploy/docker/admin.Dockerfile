FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_GIT_SHA=local
ENV NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA

COPY package.json package-lock.json next.config.mjs tsconfig.json next-env.d.ts ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/scheduler/package.json apps/scheduler/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sdk/package.json packages/sdk/package.json
COPY app app
COPY lib lib
COPY public public
RUN npm ci
RUN npm run build

CMD ["npm", "run", "start"]
