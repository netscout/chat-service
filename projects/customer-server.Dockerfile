FROM node:14 AS base

# 앱 디렉터리 생성
WORKDIR /usr/src/app
EXPOSE 3001

# 로그 디렉터리 생성 및 권한 부여
RUN mkdir /var/log/app && chown node /var/log/app && mkdir node_modules && chown node node_modules

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

RUN npm install && chown -R node /usr/src/app

USER node

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
COPY --from=build --chown=node:node /usr/src/app/dist ./dist

# ui 앱 소스 추가
COPY --from=ui-build --chown=node:node /usr/src/app/ui/dist/customer-lobby-ui ./ui/dist

# RUN chown -R node /usr/src/app

USER node