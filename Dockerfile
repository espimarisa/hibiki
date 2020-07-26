FROM node:alpine
RUN apk add git

ENV HOME /app
COPY . /app
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
 && npm install --only=production --no-optional \
 && apk del .build-deps
USER nobody

EXPOSE 5555-5558

CMD npm run setup && npm start
