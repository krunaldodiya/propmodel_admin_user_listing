# Base stage for common setup
FROM node:20-alpine as base
WORKDIR /usr/src/app

# Dependencies stage
FROM base as deps
COPY package*.json ./
RUN npm install

# Development stage
FROM base as development
RUN apk add --no-cache netcat-openbsd
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm install -g nodemon

# Production stage
FROM base as production
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

CMD ["node", "src/server.js"] 