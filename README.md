# KUDO Website

The KUDO web site is build using [VuePress](https://v1.vuepress.vuejs.org/).

### Building the site locally

* Install [NodeJS](https://nodejs.org/en/download/)
* Install [Yarn](https://yarnpkg.com/lang/en/docs/install/)

In the root of the project, run
```bash
yarn install
make build
yarn docs:lint
yarn docs:dev

#or make local-run target calls yarm docs:dev
make local-run
```

The output will inform you about the address the site is served (usually http://localhost:8080).

#### Via Docker
You can choose to install and run the above dependencies in a Docker container instead, if you do not wish to pollute your local environment.

First, build the development image with:

```bash
make docker-build
```

And then run VuePress in a container from this image by doing:

```bash
make docker-run
```


## Documentation Guidelines

Please follow the [documentation guidelines](https://kudo.dev/internal-docs/#general-guidelines), which are pretty high level for now.

### Adding Events

Events are rendered from markdown pages located in the [events folder](https://github.com/kudobuilder/www/tree/master/content/community/events). The format is documented [here](https://kudo.dev/internal-docs/events-index.html).

### Custom Components

Custom components that you should consider using when writing documentation are described [here](https://kudo.dev/internal-docs/#custom-components).
