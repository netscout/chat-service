# 고객 - 상담원 채팅 서비스

이 프로젝트는 고객과 상담원의 채팅 서비스를 간단하게 구현합니다.

고객-상담원, 상담원-상담원 간의 채팅을 지원합니다.

Angular 11, node 14, socket.io, kafka, redis 등을 활용하여 작성되었으며, lerna와 yarn workspace를 통해 모노리포 구조로 작성되었습니다.

## Kafka / Redis 실행

고객 서비스와 상담원 서비스의 세션 데이터 저장을 위해 Redis를 사용합니다.

그리고 고객 서비스와 상담원 서비스 간의 채팅 메세지 전송을 위해 Kafka를 사용하며 간단한 테스트를 위해 단일 Zookeeper / Kakfa 인스턴스를 사용하여 진행합니다.

다음 명령어로 Redis와 Kafka를 실행합니다.

```bash
C:\Sources\chat-service>docker-compose -f docker-compose.yml -f kafka-stack-docker-compose/zk-single-kafka-single.yml up

...중략...

kafka1_1  | [2021-02-11 01:04:30,961] INFO Successfully submitted metrics to Confluent via secure endpoint (io.confluent.support.metrics.submitters.ConfluentSubmitter)
kafka1_1  | [2021-02-11 01:04:34,810] INFO [Controller id=1] Processing automatic preferred replica leader election (kafka.controller.KafkaController)

```

## 채팅 서비스 설정 및 실행

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