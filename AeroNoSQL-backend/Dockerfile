FROM node:14.11.0

RUN mkdir -p /app/src

WORKDIR /app

COPY pip-packages.txt .

RUN apt update

RUN apt install -y python3-pip

RUN pip3 install --requirement=pip-packages.txt

COPY . .

RUN npm install

RUN npx tsc

EXPOSE 80

CMD ["npm", "start"]