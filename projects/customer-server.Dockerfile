FROM node:14 AS base

# 앱 디렉터리 생성
WORKDIR /usr/src/app
EXPOSE 3001

#ENV KAFKA_HOST localhost:9092
ENV REDIS_HOST redis
ENV REDIS_PWD votmdnjem
ENV KAFKA_HOST kafka:9092
ENV KAFKA_CLIENT_ID customer_lobby_server
ENV UI_APP_NAME customer-lobby-ui
ENV KAFKA_TO_CUSTOMER_TOPIC to-customer
ENV KAFKA_TO_ADMIN_TOPIC to-admin
ENV KAFKA_GROUP chat-customer-group
ENV PORT 3001
ENV FRONT_URL http://localhost:4201

COPY ./customer-lobby-server/package*.json ./

FROM base AS dev

RUN npm install

FROM base AS build

# 앱 소스 추가
COPY ./customer-lobby-server .

RUN npm install && npm run build

# TODO: 배포 설정 확인 필요
FROM base AS prod

ENV FRONT_URL http://customer-lobby-ui:4201

RUN npm ci --only=production

# 앱 소스 추가
COPY --from=build /usr/src/app/dist ./dist