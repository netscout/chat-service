FROM node:14 AS base

# 앱 디렉터리 생성
WORKDIR /usr/src/app
EXPOSE 3001

#ENV KAFKA_HOST localhost:9092
ENV REDIS_HOST redis
ENV REDIS_PWD votmdnjem
ENV KAFKA_HOST kafka:9092
ENV KAFKA_CLIENT_ID customer_lobby_server
ENV KAFKA_TO_CUSTOMER_TOPIC to-customer
ENV KAFKA_TO_ADMIN_TOPIC to-admin
ENV KAFKA_GROUP chat-customer-group
ENV PORT 3001
ENV FRONT_URL http://localhost:4201

COPY ./customer-lobby-server/package*.json ./

# -----------------개발-------------------
FROM base AS dev

RUN npm install

# -----------------배포용 UI 빌드-------------------
FROM base as ui-build

COPY ./customer-lobby-ui ./ui

#package.json에 포함되어 있어서 이거는 필요 없을 듯. npm install @angluar/cli
RUN cd ui && npm install && npm run build-staging

# -----------------배포용 서버 빌드-------------------
FROM base AS build

# 앱 소스 추가
COPY ./customer-lobby-server .

RUN npm install && npm run build

# -----------------배포-------------------
FROM base AS prod

ENV FRONT_URL http://localhost

RUN npm ci --only=production

# 서버 앱 소스 추가
COPY --from=build /usr/src/app/dist ./dist

# ui 앱 소스 추가
COPY --from=ui-build /usr/src/app/ui/dist/customer-lobby-ui ./ui/dist