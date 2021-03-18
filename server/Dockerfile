FROM node:current-alpine

ENV NODE_ENV=production \
	SERVICEDIR=services \
	CACHE_AUTH=todo@6379

RUN mkdir /app
WORKDIR /app
VOLUME [ "/logs" ]

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
