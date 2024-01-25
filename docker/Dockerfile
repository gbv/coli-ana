FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache gawk

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

RUN mkdir /config

# Use pm2 to run app
RUN npm i -g pm2
RUN cp ecosystem.example.json ecosystem.config.json

CMD pm2-runtime ecosystem.config.json
