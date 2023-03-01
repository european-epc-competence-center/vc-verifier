# develop stage
FROM node:alpine as develop-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# build stage
FROM develop-stage as build-stage
ARG NODE_ENV=production
ARG PUBLIC_PATH=verifier
ARG BASE_URL=https://ssi.eecc.de
ARG VERIFIER_API=https://ssi.eecc.de/api/verifier
ENV NODE_ENV=${NODE_ENV:-production}
ENV PUBLIC_PATH=${PUBLIC_PATH:-verifier}
ENV BASE_URL=${BASE_URL:-https://ssi.eecc.de}
ENV VERIFIER_API=${VERIFIER_API:-https://ssi.eecc.de/api/verifier}
RUN npm run build

# production stage
FROM nginx:alpine as production-stage
ARG PUBLIC_PATH
COPY --from=build-stage /app/dist /usr/share/nginx/html/${PUBLIC_PATH}
CMD ["nginx", "-g", "daemon off;"]