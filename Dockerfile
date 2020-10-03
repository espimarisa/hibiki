FROM node:alpine
RUN apk add git

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

WORKDIR /app

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
 && npm install --only=production \
 && apk del .build-deps
COPY . /app
USER nobody

EXPOSE 7012
EXPOSE 7013

CMD ["node", "."]