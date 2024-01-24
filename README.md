# coli-ana

[![Test](https://github.com/gbv/coli-ana/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/coli-ana/actions/workflows/test.yml)

> API to analyze DDC numbers

This repository contains an implementation of an API to analyze synthesized DDC numbers. The algorithm to split DDC numbers is not included. See <https://coli-conc.gbv.de/coli-ana/> for more information.

## Table of Contents <!-- omit in toc -->
- [Install](#install)
- [Usage](#usage)
  - [`vc_day_srv` Backend Configuration](#vc_day_srv-backend-configuration)
  - [Data dumps and statistics](#data-dumps-and-statistics)
  - [Development](#development)
  - [Production](#production)
  - [K10plus enrichment](#k10plus-enrichment)
- [Configuration](#configuration)
- [API](#api)
  - [GET /](#get-)
  - [GET /analyze?notation=notations](#get-analyzenotationnotations)
- [Maintainers](#maintainers)
- [Publish](#publish)
- [Contribute](#contribute)
- [License](#license)

## Install

You will need Node.js version 18 or later (20 is recommended).

~~~bash
git clone https://github.com/gbv/coli-ana.git
cd coli-ana
npm ci
~~~

## Usage

The server provides a HTTP API at port 11033 by default. (Fun fact: 11033 = Octal 025431 (025.431=Dewey Decimal Classification))

It requires access to an instance of the `vc_day_srv` backend.

### `vc_day_srv` Backend Configuration

`vc_day_srv` is a server component developed as part of project colibri (currently closed source) that can analyze DDC numbers and return the analyses to a client. It can be configured via `.env`:

```env
# These are the default values
BACKEND_INTERPRETER="/usr/bin/awk -f"
BACKEND_CLIENT=./bin/vc_day_cli2
BACKEND_HOST=localhost
BACKEND_PORT=7070
```

That requests are performed via the corresponding client component `vc_day_cli2` which is shipped in this repository. So no protocol should be given for host. The backend is required for the service to work. Multiple backends (for `BACKEND_HOST` and `BACKEND_PORT`) can be given and will be rotated either on connection error or on stale requests. Note that the number of hosts and ports given must match (even if the same value needs to be repeated).

Note that GNU awk is required. On macOS, this can be installed with [Homebrew](https://brew.sh/) - `brew install gawk` - and configured as `BACKEND_INTERPRETER="/opt/homebrew/bin/gawk -f"` (Apple Silicon) or `BACKEND_INTERPRETER="/usr/local/bin/gawk -f"` (Intel).

### Data dumps and statistics

The script `./bin/stats.sh` creates a database dump (unless the file already exists, so it is not updated) and calculates some statistics into `public/stats.json`.

### Development
```bash
npm run dev
```

### Production
```bash
# Bundle Vue files
npm run build
# Run server in production
npm run serve
```

If you use a process manager like [pm2](https://pm2.keymetrics.io/) and need to run server.js directly, make sure to append the necessary flags:

```bash
NODE_ENV=production node --experimental-json-modules -r dotenv/config server
```

### K10plus enrichment

*See <https://github.com/gbv/k10plus-ddc>!*

Directory `k10plus` contains legacy scripts to enrich K10plus library catalog with analyzed DDC notations. See [README.md](k10plus/README.md) in this directory.

The script `bin/labels.sh` created one text file for each DDC number in directory `labels` for full text indexing.

## Configuration

You can adjust a few configuration options in `.env`. Here are the available options and default values:

```bash
# Configuration for backend service `vc_day_srv` (see above)
BACKEND_INTERPRETER="/usr/bin/awk -f"
BACKEND_CLIENT=./bin/vc_day_cli2
BACKEND_HOST=localhost
BACKEND_PORT=7070
# URL to Cocoda instance
COCODA=https://coli-conc.gbv.de/cocoda/app/
# Port for Express server
PORT=11033
# Base for URL (e.g. when not running under root of domain)
BASE=/
# Verbosity for log output (log/info/warn/error)
VERBOSITY=info
# Settings for retries
MAX_RETRIES=3
RETRY_WAIT=1000
# Timeouts in milliseconds for long (will be logged) and stale (will be killed) commands to the backend
TIMEOUT_LONG=1000
TIMEOUT_STALE=3000
```

## API

### GET /

Shows a landing page with a web interface, general information, and a list of examples.

### GET /analyze?notation=notations

Analyzes a DDC number in parameter `notation` and returns an array with zero or one [JSKOS concepts](https://gbv.github.io/jskos/jskos.html#concept) by default.

Optional parameter `complete` with a truthy value enables filtering for completely analyzed numbers.

Parameter `atomic` with a truthy value returns only atomic numbers. Atomic numbers are always marked with non-standard JSKOS field `ATOMIC` having value `true`.

Parameter `format` can be used to chose another format (deprecated, may be removed in a later version):

* `picajson` returns a [PICA/JSON](https://format.gbv.de/pica/json) record
* `pp` returns a [PICA Plain](https://format.gbv.de/pica/plain) record; **note:** only one record can be requested at the time.

## Maintainers
- [@stefandesu](https://github.com/stefandesu)
- [@nichtich](https://github.com/nichtich)

## Publish
Please work on the `dev` branch or separate feature branch during development.

When a new release is ready (i.e. the features are finished, merged into `dev`, and all tests succeed), run the included release script (replace "patch" with "minor" or "major" if necessary):

```bash
npm run release:patch
```

This will:
- Run tests and build to make sure everything works
- Switch to `dev`
- Make sure `dev` is up-to-date
- Run `npm version patch` (or "minor"/"major")
- Push changes to `dev`
- Switch to `main`
- Merge changes from `dev`
- Push `main` with tags
- Switch back to `dev`

After running this, GitHub Actions will automatically create a new GitHub Release draft. Please edit and publish the release manually.

## Contribute
PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License
MIT Copyright (c) 2023 Verbundzentrale des GBV (VZG)
