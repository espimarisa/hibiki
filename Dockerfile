FROM node:alpine
RUN apk add git


ENV HOME /app
COPY . /app
WORKDIR /app
RUN npm i --no-optional
USER nobody

EXPOSE 9099

CMD ["node", "src/index.js"]
