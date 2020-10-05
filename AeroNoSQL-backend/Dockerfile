FROM node:14.11.0

RUN mkdir -p /app/src

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]