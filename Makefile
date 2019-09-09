DOCKER_TAG ?=$(shell git rev-parse --short HEAD)
DOCKER_IMG ?= kudobuilder/www

dev-image:
	DOCKER_BUILDKIT=1 docker build -t ${DOCKER_IMG}:${DOCKER_TAG} .

dev:
	docker run -it --rm --name=kudowww -p 8080:8080 -v ${PWD}:/app ${DOCKER_IMG}:${DOCKER_TAG}
