FROM node:14 AS base
# 앱 디렉터리 생성
WORKDIR /usr/src/app

ENV PORT 4200

EXPOSE 4200

FROM base AS dev

COPY ./admin-lobby-ui/package*.json .

RUN npm install

FROM base AS ui-build
# 앱 디렉터리 생성
WORKDIR /usr/src/app

COPY ./admin-lobby-ui ./ui

#package.json에 포함되어 있어서 이거는 필요 없을 듯. npm install @angluar/cli
RUN cd ui && npm install && npm run build-staging

FROM base AS prod

# 앱 디렉터리 생성
WORKDIR /usr/src/app

COPY --from=ui-build /usr/src/app/ui/dist/admin-lobby-ui ./public

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY ./ui-server/package*.json ./

RUN npm install
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

# 앱 소스 추가
COPY ./ui-server .