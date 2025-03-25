FROM node:20-alpine3.16

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.js .
COPY .env.production .
COPY ./src ./src

RUN apk update && apk add bash
RUN apk add --no-cache ffmpeg
RUN apk add python3

# Increase npm install timeout
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set fetch-timeout 60000

RUN npm install pm2 -g
RUN npm install --no-progress --registry=https://registry.npmjs.org/
RUN npm run build

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]