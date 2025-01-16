FROM node:20-alpine
RUN apk add --no-cache mosquitto-clients
WORKDIR /app
COPY . .
RUN apk add --no-cache mosquitto
RUN npm install
EXPOSE 1884
CMD ["npm","run","dev"]
