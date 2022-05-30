FROM node:latest AS build
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm ci --ignore-scripts
RUN npx prisma generate
ENV NODE_ENV production
RUN npm run build


FROM node:lts-alpine
RUN apk add dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/prisma /usr/src/app/prisma
COPY --chown=node:node --from=build /usr/src/app/dist/index.js /usr/src/app/index.js
CMD ["dumb-init", "node", "index.js"]