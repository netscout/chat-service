FROM node:14 AS base

# 앱 디렉터리 생성
WORKDIR /usr/src/app
EXPOSE 3001

#ENV KAFKA_HOST localhost:9092
ENV KAFKA_HOST kafka:9092
ENV UI_APP_NAME customer-lobby-ui
ENV KAFKA_TO_CUSTOMER_TOPIC to-customer
ENV KAFKA_TO_ADMIN_TOPIC to-admin
ENV KAFKA_GROUP chat-customer-group
ENV PORT 3001

FROM base AS dev

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package*.json ./

RUN npm install
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

FROM base AS prod

# 앱 소스 추가
COPY . .

RUN npm ci --only=production

# CMD [ "npm", "run", "dev" ]