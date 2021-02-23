# coli-ana

[![Test](https://github.com/gbv/coli-ana/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/coli-ana/actions/workflows/test.yml)

> API to decompose DDC numbers

This repository contains an implementation of an API to decompose synthesized DDC numbers. The algorithm to split DDC numbers is not included. See <https://coli-conc.gbv.de/coli-ana/> for more information.

## Table of Contents <!-- omit in toc -->
- [Install](#install)
- [Usage](#usage)
  - [Preparing the database](#preparing-the-database)
  - [Development](#development)
  - [Production](#production)
- [Configuration](#configuration)
- [API](#api)
  - [GET /](#get-)
  - [GET /decompose](#get-decompose)
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

coli-ana uses a PostgreSQL database. Please create a database and provide the connection string inside a `.env` file, e.g.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/coli-ana"
```

We also need to create the necessary tables. For this, we are using [Prisma](https://www.prisma.io) with [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate):

```bash
npx prisma migrate dev --preview-feature --name ""
```

You might need to run this command after updating coli-ana as well.

Now that the database and tables are prepared, you can import coli-ana results (in `slim` format), e.g.:

```bash
node ./bin/convert --import ~/path/to/ou_liu_t_de-slim-21-02-15-1121
```

### Development
~~~bash
npm run dev
~~~

### Production
```bash
# Bundle Vue files
npm run build
# Run server in production
npm run serve
```

## Configuration

You can adjust a few configuration options in `config/config.user.js`. Note that it must be an ES6 module exporting a default JSON object. Please refer to `config/config.default.js` for available options.

## API

### GET /

Shows a landing page with general information and a list of examples.

### GET /decompose

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
