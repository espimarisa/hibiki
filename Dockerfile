# Currently broken! Don't try and use this until it's fixed.
# - Espi

FROM node:alpine
RUN apk add git

ENV HOME /app
COPY . /app
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
 && npm install --only=production --no-optional \
 && apk del .build-deps
USER nobody

EXPOSE 7012-7013

CMD npm run setup && npm start
