FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache gawk

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Build static front end
RUN npm run build

# Use pm2 to run app
RUN npm i -g pm2
RUN cp ecosystem.example.json ecosystem.config.json

CMD pm2-runtime ecosystem.config.json
