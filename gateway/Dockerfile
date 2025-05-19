FROM node:20-alpine

WORKDIR /app
COPY .env .
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . /app
COPY routes/docker.json /app/routes/routes.json

CMD ["node", "./index.js"]