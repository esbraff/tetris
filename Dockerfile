FROM node:latest

RUN npm install -g http-server

WORKDIR /app
COPY . .

EXPOSE 5050

CMD http-server . -p 5050