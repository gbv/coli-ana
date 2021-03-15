# coli-ana

[![Test](https://github.com/gbv/coli-ana/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/coli-ana/actions/workflows/test.yml)

> API to analyze DDC numbers

This repository contains an implementation of an API to analyze synthesized DDC numbers. The algorithm to split DDC numbers is not included. See <https://coli-conc.gbv.de/coli-ana/> for more information.

## Table of Contents <!-- omit in toc -->
- [Install](#install)
- [Usage](#usage)
  - [Preparing the database](#preparing-the-database)
  - [Database migrations](#database-migrations)
  - [Development](#development)
  - [Production](#production)
- [Configuration](#configuration)
- [API](#api)
  - [GET /](#get-)
  - [GET /analyze](#get-analyze)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

~~~bash
git clone https://github.com/gbv/coli-ana.git
cd coli-ana
npm install
~~~

## Usage

The server provides a HTTP API at port 11033 by default. (Fun fact: 11033 = Octal 025431 (025.431=Dewey Decimal Classification))

### Preparing the database

coli-ana uses a PostgreSQL database. For instance create a database `coli-ana`:

```sql
CREATE DATABASE "coli-ana";
CREATE USER "username" PASSWORD 'password';
GRANT ALL ON DATABASE "coli-ana" TO "coli-ana";
```

Provide the connection string inside a `.env` file, e.g.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/coli-ana"
```

We also need to create the necessary tables. For this, we are using [Prisma](https://www.prisma.io):

```bash
npx prisma db push --preview-feature
```

Now that the database and tables are prepared, you can import coli-ana results (in `slim` format), e.g.:

```bash
node ./bin/convert --import ~/path/to/ou_liu_t_de-slim-21-02-15-1121
```

Add `--reset` to delete old records from the database.

### Database migrations

Sometimes, a database migration might be necessary. It will be mentioned in the release notes. In that case, please run the following command to migrate your database:

```bash
npx prisma migrate dev --preview-feature
```

If the migration script shows "All data will be lost", you will need to reimport the data after migration.

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

## Configuration

You can adjust a few configuration options in `.env`. Here are the available options and default values:

```bash
# URL to access PostgreSQL database
DATABASE_URL=
# URL to Cocoda instance
COCODA=https://coli-conc.gbv.de/cocoda/app/
# Port for Express server
PORT=11033
# Base for URL (e.g. when not running under root of domain)
BASE=/
```

## API

### GET /

Shows a landing page with general information and a list of examples.

### GET /analyze

Analyzes one or more DDC numbers in parameter `notation` (separated by `|`) and returns a [JSKOS concept](https://gbv.github.io/jskos/jskos.html#concept) by default. Parameter `format` can be used to chose another format:

* `picajson` returns a [PICA/JSON](https://format.gbv.de/pica/json) record
* `pp` returns a [PICA Plain](https://format.gbv.de/pica/plain) record; **note:** only one record can be requested at the time.

## Maintainers
- [@stefandesu](https://github.com/stefandesu)
- [@nichtich](https://github.com/nichtich)

## Contribute
PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License
MIT Copyright (c) 2021 Verbundzentrale des GBV (VZG)
