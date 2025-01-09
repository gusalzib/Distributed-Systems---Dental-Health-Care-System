FROM node:20-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache mosquitto
RUN npm install
EXPOSE 1884
CMD ["npm","run","dev"]
