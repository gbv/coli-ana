# coli-ana-api

> API to decompose DDC numbers

This repository contains an implementation of an API to decompose synthesized DDC numbers. The algorithm to split DDC numbers is not included. See <https://coli-conc.gbv.de/coli-ana/> for more information.

## Table of Contents

* [Install](#install)

## Install

~~~bash
git clone https://github.com/gbv/coli-ana-api.git
cd login-server
npm install
~~~

## Usage

~~~bash
npm run start
~~~

The server provides a HTTP API at port 11033 by default.

### GET /

Shows a landing page with general information and a list of examples.

### GET /:number

Analyzes a DDC number and returns a [JSKOS concept](https://gbv.github.io/jskos/jskos.html#concept) by default. Parameter `format` can be used to chose another format:

* `picajson` returns a [PICA/JSON](https://format.gbv.de/pica/json) record
* `pp` returns a [PICA Plain](https://format.gbv.de/pica/plain) record

