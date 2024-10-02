# [coli-ana](https://github.com/gbv/coli-ana) (Docker)

See [GitHub](https://github.com/gbv/coli-ana) for more information about the tool.

## Supported Architectures
Currently, only `x86-64` is supported.

## Available Tags
- The current release version is available under `latest`. However, new major versions might break compatibility of the previously used config file, therefore it is recommended to use a version tag instead.
- We follow SemVer for versioning the application. Therefore, `x` offers the latest image for the major version x, `x.y` offers the latest image for the minor version x.y, and `x.y.z` offers the image for a specific patch version x.y.z.
- Additionally, the latest development version is available under `dev`.

## Usage
It is recommended to run the image using [Docker Compose](https://docs.docker.com/compose/). Note that depending on your system, it might be necessary to use `sudo docker compose`. For older Docker versions, use `docker-compose` instead of `docker compose`.

1. Create `docker-compose.yml`:

```yml
services:
  coli-ana:
    image: ghcr.io/gbv/coli-ana
    environment:
      - PORT=2013
      - BASE=/
    ports:
      - 11033:11033
    restart: unless-stopped
```

2. Start the application:

```bash
docker compose up -d
```

This will create and start a coli-ana container running under host (and guest) port 11033. See [Configuration](#configuration) on how to configure it.

You can now access the application under `http://localhost:11033`.

## Application Setup
Note: After adjusting any configurations, it is required to recreate the container: `docker compose up -d`

### Configuration
Please refer to the [main documentation](https://github.com/gbv/coli-ana/#configuration) for more information and all available options.
