FROM node:16 AS base
WORKDIR /usr/local/app

FROM base AS backend-dev
CMD ["yarn", "dev"]

FROM base AS client-dev
CMD ["yarn", "dev"]

FROM base AS client-build
COPY client/package.json client/yarn.lock client/tsconfig.json ./
RUN yarn install
COPY client/public ./public
COPY client/src ./src
RUN yarn build

FROM base
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --production && \
    yarn cache clean
COPY backend/src ./src
COPY --from=client-build /usr/local/app/build ./src/static
CMD ["node", "src/index.js"]
