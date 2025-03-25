# FROM node:20-alpine3.16

# WORKDIR /app

# COPY package.json .
# COPY package-lock.json .
# COPY tsconfig.json .
# COPY ecosystem.config.js .
# COPY .env.production .
# COPY ./src ./src

# RUN apk update && apk add bash
# RUN apk add --no-cache ffmpeg
# RUN apk add python3
# RUN npm install pm2 -g
# RUN npm install
# RUN npm run build

# CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
# Build stage
FROM node:20-alpine3.16 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine3.16
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js .env.production ./
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
