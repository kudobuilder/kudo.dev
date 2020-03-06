DOCKER_TAG ?=$(shell git rev-parse --short HEAD)
DOCKER_IMG ?= kudobuilder/www

.PHONY: docker-build
docker-build: external-docs
	DOCKER_BUILDKIT=1 docker build -t ${DOCKER_IMG}:${DOCKER_TAG} .

.PHONY: docker-run
docker-run:
	docker run -it --rm --name=kudowww -p 8080:8080 -v ${PWD}:/app ${DOCKER_IMG}:${DOCKER_TAG}

.PHONY: build
build:	external-docs
	yarn docs:build

.PHONY: external-docs
external-docs:
	./embed-operator-docs.sh

.PHONY: local-run
local-run:
	yarn docs:dev
