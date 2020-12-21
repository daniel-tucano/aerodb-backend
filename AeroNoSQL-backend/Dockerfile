FROM node:14.11.0

RUN apt update

RUN apt install -y python3-pip

RUN pip3 install --requirement=pip-packages.txt

RUN mkdir -p /app/src

WORKDIR /app

COPY . .

RUN npm install

RUN npx tsc

EXPOSE 80

CMD ["npm", "start"]