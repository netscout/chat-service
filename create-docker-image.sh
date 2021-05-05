#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail
# 프로젝트 디렉토리로 이동
#cd ~/workspace/example-api/
# 최신 코드 받기
git fetch --all
git reset --hard origin/master
git pull origin master
# docker 환경 변수 설정
export LANG=en_US.UTF-8
export DOCKER_APP_NAME="chat-service"
export PUSH_TAG="dev"
export DOCKER_REGISTRY_NAME=$DOCKER_APP_NAME-$PUSH_TAG
export DOCKER_LATEST_TAG=latest
export DOCKER_IMAGE_TAG=$DOCKER_REGISTRY_NAME:$DOCKER_LATEST_TAG
# 이전 도커 이미지 태깅
set +e
export DOCKER_IMAGE_BACKUP_TAG=$DOCKER_IMAGE_TAG"-bak"
docker tag $DOCKER_IMAGE_TAG $DOCKER_IMAGE_BACKUP_TAG
docker rmi $DOCKER_IMAGE_TAG
set -e
# 도커 이미지 빌드
echo ">>>>>build image"
docker build --force-rm=true --no-cache -t $DOCKER_IMAGE_TAG .
# set +e
# echo ">>>>>stop old container"
# docker stop $DOCKER_REGISTRY_NAME
set -e
# 도커 이미지 실행
# echo ">>>>>run container:"$DOCKER_REGISTRY_NAME $DOCKER_IMAGE_TAG
# docker run --rm -d --network host \
#        -it --name $DOCKER_REGISTRY_NAME $DOCKER_IMAGE_TAG
# 이전 도커 이미지 삭제
echo ">>>>>remove old docker image"
set +e
docker rmi $DOCKER_IMAGE_BACKUP_TAG
set -e