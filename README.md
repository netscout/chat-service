# 고객 - 상담원 채팅 서비스

이 프로젝트는 고객과 상담원의 채팅 서비스를 간단하게 구현합니다.

고객-상담원, 상담원-상담원 간의 채팅을 지원합니다.

Angular 11, node 14, socket.io, kafka, redis 등을 활용하여 작성되었으며, lerna와 yarn workspace를 통해 모노리포 구조로 작성되었습니다.

이 프로젝트를 실행하는 방법은 크게 3가지가 있습니다.

1. lerna를 통한 모노리포 실행
1. docker-compose를 통한 개발 환경 실행
1. 쿠버네티스로 로컬에서 운영환경 테스트

개발 환경으로는 docker-compose를 통해 실행하는 것을 추천합니다.

## 폴더 구조

```
📦chat-service 
 ┣ 📂IdentityService   # 미완성
 ┣ 📂components   # Dapr 컴포넌트(미완성)
 ┣ 📂kafka-stack-docker-compose   # kafka 단독 실행을 위한 docker-compose 파일
 ┣ 📂projects   # 프로젝트 폴더
 ┃ ┣ 📂admin-lobby-server   # 상담원 채팅 로비 서버
 ┃ ┣ 📂admin-lobby-ui   # 상담원 채팅 로비 UI
 ┃ ┣ 📂customer-lobby-server   # 고객 채팅 로비 서버
 ┃ ┣ 📂customer-lobby-ui   # 고객 채팅 로비 UI
 ┃ ┣ 📂lobby-server-logger   # 일별 롤링 로그 남기는 npm 패키지
 ┃ ┣ 📂ui-server   # UI 호스팅을 위한 서버(사용하지 않음)
 ┃ ┣ 📜.dockerignore   # dockerignore 파일
 ┃ ┣ 📜admin-server.Dockerfile   # 상담원 채팅 로비 서버 Dockerfile
 ┃ ┣ 📜admin-ui.Dockerfile   # 상담원 채팅 로비 UI Dockerfile
 ┃ ┣ 📜customer-server.Dockerfile   # 고객 채팅 로비 서버 Dockerfile
 ┃ ┗ 📜customer-ui.Dockerfile   # 고객 채팅 로비 UI Dockerfile
 ┣ 📜.gitattributes
 ┣ 📜.gitignore
 ┣ 📜LICENSE
 ┣ 📜README.md
 ┣ 📜create-docker-image.sh
 ┣ 📜docker-compose-build.yaml   # Kompose로 변환을 위해 사용한 docker-compose 파일
 ┣ 📜docker-compose-prod.yaml   # 배포용 이미지 생성을 위한 docker-compose 파일
 ┣ 📜docker-compose.yaml   # 개발 환경 실행을 위한 docker-compose 파일
 ┣ 📜k8s.yaml   # 쿠버네티스 환경 실행을 위한 설정 파일
 ┣ 📜lerna.json   # lerna 설정 파일
 ┣ 📜package.json
 ┣ 📜todo.txt
 ┗ 📜yarn.lock
```

## docker-compose로 개발환경 실행

다음 명령어를 통해 개발 환경을 실행합니다.

```bash
> docker-compose up -d
```

설정이 완료되면, 2개의 브라우저를 열어서 각각 http://localhost:4200, http://localhost:4201 으로 접속하여 채팅 테스트를 진행할 수 있습니다.

## 쿠버네티스로 로컬에서 운영환경 테스트

쿠버네티스 환경 설정을 위한 __k8s.yaml__ 파일은 __docker-compose-build.yaml__ 파일에서 [Kompose](https://kompose.io/)를 통해 변환 및 생성되었으며, 다음 명령과 같이 __Kompose__ 를 활용할 수 있습니다.

```base
> kompose convert -f docker-compose-build.yaml -o ./k8s.yaml
```

다음 명령어를 통해 운영 환경을 실행합니다.

```bash
> kubectl apply -f k8s.yaml
```

설정이 완료되면, 2개의 브라우저를 열어서 각각 http://localhost:30000, http://localhost:30001 으로 접속하여 채팅 테스트를 진행할 수 있습니다.

운영 환경 관리는 __kubectl__ 을 직접사용하는 것 보다는 [k9s](https://github.com/derailed/k9s)사용을 추천합니다.

### 쿠버네티스 이미지 업데이트

변경사항을 적용한 뒤 새 이미지를 실행하려면, __docker-compose-prod.yaml__ 파일의 각 이미지 버전을 업데이트 한다.(ex: 0.4 -> 0.5) 그리고 다음 명령을 통해 이미지를 빌드합니다.

```bash
> docker-compose -f docker-compose-prod.yaml build
```

이미지 빌드 후 __k8s.yaml__ 파일의 이미지 버전을 역시 업데이트하고 다음 명령을 통해 새 이미지를 적용합니다.

```bash
> kubectl apply -f k8s.yaml
```

쿠버네티스가 자동으로 이전 버전의 이미지를 중지 및 제거하고 새 버전의 이미지를 실행하면서 업데이트를 진행합니다.

## lerna를 통한 채팅 서비스 설정 및 실행

### Kafka / Redis 실행

고객 서비스와 상담원 서비스의 세션 데이터 저장을 위해 Redis를 사용합니다.

그리고 고객 서비스와 상담원 서비스 간의 채팅 메세지 전송을 위해 Kafka를 사용하며 간단한 테스트를 위해 단일 Zookeeper / Kakfa 인스턴스를 사용하여 진행합니다.

다음 명령어로 Redis와 Kafka를 실행합니다.

```bash
C:\Sources\chat-service>docker-compose -f docker-compose.yaml -f kafka-stack-docker-compose/zk-single-kafka-single.yaml up

...중략...

kafka1_1  | [2021-02-11 01:04:30,961] INFO Successfully submitted metrics to Confluent via secure endpoint (io.confluent.support.metrics.submitters.ConfluentSubmitter)
kafka1_1  | [2021-02-11 01:04:34,810] INFO [Controller id=1] Processing automatic preferred replica leader election (kafka.controller.KafkaController)

```

### 채팅 서비스 설정

프로젝트 루트 폴더에서 다음 명령으로 lerna 및 프로젝트의 패키지를 설치합니다.

```bash
C:\Sources\chat-service>yarn install
yarn install v1.22.10
[1/4] Resolving packages...
[2/4] Fetching packages...
info fsevents@2.3.2: The platform "win32" is incompatible with this module.
info "fsevents@2.3.2" is an optional dependency and failed compatibility check. Excluding it from installation.
info fsevents@2.1.3: The platform "win32" is incompatible with this module.
info "fsevents@2.1.3" is an optional dependency and failed compatibility check. Excluding it from installation.
info fsevents@1.2.13: The platform "win32" is incompatible with this module.
info "fsevents@1.2.13" is an optional dependency and failed compatibility check. Excluding it from installation.
[3/4] Linking dependencies...
warning "lerna > @lerna/version > @lerna/github-client > @octokit/rest > @octokit/plugin-request-log@1.0.3" has unmet peer dependency "@octokit/core@>=3".
warning "workspace-aggregator-591bf80e-096c-4963-ad80-a8b417f53e85 > ui-admin-lobby > bootstrap@4.6.0" has unmet peer dependency "jquery@1.9.1 - 3".
warning "workspace-aggregator-591bf80e-096c-4963-ad80-a8b417f53e85 > ui-admin-lobby > bootstrap@4.6.0" has unmet peer dependency "popper.js@^1.16.1".
warning "workspace-aggregator-591bf80e-096c-4963-ad80-a8b417f53e85 > ui-admin-lobby > ngx-socket-io@3.2.0" has incorrect peer dependency "@angular/common@^10.0.0".
warning "workspace-aggregator-591bf80e-096c-4963-ad80-a8b417f53e85 > ui-admin-lobby > ngx-socket-io@3.2.0" has incorrect peer dependency "@angular/core@^10.0.0".
[4/4] Building fresh packages...
Done in 56.62s.
```

그리고 코드 편집기를 열어 상담원 채팅 서버 프로젝트의 __projects/admin-lobby-server/__ 폴더에 __.env__ 파일을 생성하고 다음과 같이 작성합니다.

```javascript
KAFKA_HOST=localhost:9092
UI_APP_NAME=admin-lobby-ui
KAFKA_TO_CUSTOMER_TOPIC=to-customer
KAFKA_TO_ADMIN_TOPIC=to-admin
KAFKA_GROUP=chat-admin-group
```

위 설정 파일에는 Kafka의 주소, 카프카를 통해 메세지를 주고 받은 토픽, 컨슈머 그룹 등의 정보가 작성되어 있습니다.

다음으로 고객 채팅 서버의 __projects/customer-lobby-server/__ 폴더에 __.env__ 파일을 생성하고 다음과 같이 작성합니다.

```javascript
KAFKA_HOST=localhost:9092
UI_APP_NAME=customer-lobby-ui
KAFKA_TO_CUSTOMER_TOPIC=to-customer
KAFKA_TO_ADMIN_TOPIC=to-admin
KAFKA_GROUP=chat-customer-group
PORT=3001
```

### 채팅 서비스 실행

프로젝트 루트 폴더에서 다음 명령어를 실행하여 전체 프로젝트를 실행합니다.

```bash
C:\Sources\chat-service>yarn start
```

위 명령은 lerna를 통해 projects 폴더안에 위치한 모든 프로젝트에 대해서 __yarn start__ 명령을 실행합니다.

빌드가 완료되면, 2개의 브라우저를 열어서 각각 http://localhost:4200, http://localhost:4201 으로 접속하여 채팅 테스트를 진행할 수 있습니다.

혹시 브라우저로 접속이 되지 않는 프로젝트가 있다면, 동시 빌드 과정에서 출동이 생긴 것이므로 __Ctrl+C__ 로 실행을 멈추고 다시 실행하면 정상적으로 실행할 수 있습니다.