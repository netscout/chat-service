# 고객 - 상담원 채팅 서비스

이 프로젝트는 고객과 상담원의 채팅 서비스를 간단하게 구현합니다.

고객-상담원, 상담원-상담원 간의 채팅을 지원합니다.

Angular 11, node 14, socket.io, kafka, redis 등을 활용하여 작성되었습니다.

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

## 상담원 채팅 서비스 설정 / 실행

### 상담원 채팅 서비스 백엔드 설정

상담원 채팅 서비스 벡엔드 폴더로 이동하여 패키지를 설치합니다.

```bash
C:\Sources>cd chat-service\admin-lobby\admin-lobby-server

C:\Sources\chat-service\admin-lobby\admin-lobby-server>npm i
```

그리고 루트 폴더에 __.env__ 파일을 생성하고 다음과 같이 작성합니다.

```javascript
KAFKA_HOST=localhost:9092
UI_APP_NAME=admin-lobby-ui
KAFKA_TO_CUSTOMER_TOPIC=to-customer
KAFKA_TO_ADMIN_TOPIC=to-admin
KAFKA_GROUP=chat-admin-group
```

위 설정 파일에는 Kafka의 주소, 카프카를 통해 메세지를 주고 받은 토픽, 컨슈머 그룹 등의 정보가 작성되어 있습니다.

### 상담원 채팅 서비스 프론트 설정

상담원 채팅 서비스 프론트 폴더로 이동하여 패키지를 설치합니다.

```bash
C:\Sources>cd chat-service\admin-lobby\admin-lobby-server-ui

C:\Sources\chat-service\admin-lobby\admin-lobby-ui>npm i
```

### 상담원 채팅 서비스 실행

상담원 채팅 서비스는 백엔드를 __npm run dev__ 커맨드를 실행하면 __concurrently__ 를 통해 프론트와 함께 실행하도록 구성되어 있습니다.

다음 명령을 통해 서비스를 실행합니다.

```bash
C:\Sources\chat-service\admin-lobby\admin-lobby-server>npm run dev
```

브라우저에서 http://localhost:4200 으로 이동하여 __상담원__ 을 선택하고 로그인을 진행합니다.


## 고객 채팅 서비스 설정 / 실행

### 고객 채팅 서비스 백엔드 설정

고객 채팅 서비스 벡엔드 폴더로 이동하여 패키지를 설치합니다.

```bash
C:\Sources>cd chat-service\customer-lobby\customer-lobby-server

C:\Sources\chat-service\customer-lobby\customer-lobby-server>npm i
```

그리고 루트 폴더에 __.env__ 파일을 생성하고 다음과 같이 작성합니다.

```javascript
KAFKA_HOST=localhost:9092
UI_APP_NAME=customer-lobby-ui
KAFKA_TO_CUSTOMER_TOPIC=to-customer
KAFKA_TO_ADMIN_TOPIC=to-admin
KAFKA_GROUP=chat-customer-group
PORT=3001
```

위 설정 파일에는 Kafka의 주소, 카프카를 통해 메세지를 주고 받은 토픽, 컨슈머 그룹, node서버의 실행 포트 등의 정보가 작성되어 있습니다.

### 고객 채팅 서비스 프론트 설정

고객 채팅 서비스 프론트 폴더로 이동하여 패키지를 설치합니다.

```bash
C:\Sources>cd chat-service\customer-lobby\customer-lobby-server-ui

C:\Sources\chat-service\customer-lobby\customer-lobby-ui>npm i
```

### 고객 채팅 서비스 실행

고객 채팅 서비스는 백엔드를 __npm run dev__ 커맨드를 실행하면 __concurrently__ 를 통해 프론트와 함께 실행하도록 구성되어 있습니다.

다음 명령을 통해 서비스를 실행합니다.

```bash
C:\Sources\chat-service\admin-lobby\admin-lobby-server>npm run dev
```

브라우저에서 http://localhost:4201 으로 이동하여 로그인을 진행합니다.