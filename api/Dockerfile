FROM node:lts-alpine
WORKDIR /usr/src/app

COPY . .

RUN npm i
RUN npm run build-tsc

CMD [ "node", "dist/index.js"]