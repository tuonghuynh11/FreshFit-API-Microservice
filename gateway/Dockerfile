FROM node:20-alpine

WORKDIR /app
COPY .env .
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . /app

CMD ["node", "./index.js"]