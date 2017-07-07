FROM node

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install -g pm2
RUN npm install

COPY . /usr/src/app

EXPOSE 3000

cmd ["npm", "start"]
