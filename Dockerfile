FROM node:8.9.3-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production
COPY package.json /usr/src/app
RUN npm install && npm cache clean --force
COPY . /usr/src/app

EXPOSE 5000

CMD ["npm", "start"]