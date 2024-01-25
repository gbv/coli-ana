FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache bash
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

## Make Docker-related scripts available in root folder
COPY docker/*.sh .

CMD ["bash", "entrypoint.sh"]
