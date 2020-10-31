FROM node:14.11.0

RUN mkdir -p /app/src

WORKDIR /app

COPY package.json .

RUN npm install

RUN apt update

RUN apt install -y python3-pip

COPY pip-packages.txt .

RUN pip3 install --requirement=pip-packages.txt

COPY . .

RUN npx tsc

EXPOSE 80

CMD ["npm", "start"]