# coli-ana-api

> API to decompose DDC numbers

This repository contains an implementation of an API to decompose synthesized DDC numbers. The algorithm to split DDC numbers is not included. See <https://coli-conc.gbv.de/coli-ana/> for more information.

## Table of Contents <!-- omit in toc -->
- [Install](#install)
- [Usage](#usage)
  - [Development](#development)
  - [Production](#production)
- [API](#api)
  - [GET /](#get-)
  - [GET /decompose](#get-decompose)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

~~~bash
git clone https://github.com/gbv/coli-ana-api.git
cd coli-ana-api
npm install
~~~

## Usage

The server provides a HTTP API at port 11033 by default.

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
