import { name, version, description } from "../package.json"
import examples from "../lib/examples.json"

// TODO: Data duplication between this and ./config.js. The issue is that Vite can't import CommonJS files, so we can't import ./config.js in Home.vue.

const config = {
  name,
  version,
  description,
  examples: Object.keys(examples),
  cocoda: "https://coli-conc.gbv.de/cocoda/app/",
}

import jskos from "jskos-tools"
config.ddc = new jskos.ConceptScheme({
  uri: "http://dewey.info/scheme/edition/e23/",
  uriPattern: "^http://dewey.info/class/(.+)/e23/$",
  notationPattern: "[0-9][0-9]?|[0-9]{3}(-[0-9]{3})?|[0-9]{3}.[0-9]+(-[0-9]{3}.[0-9]+)?|[1-9][A-Z]?--[0-9]+|[1-9][A-Z]?--[0-9]+(-[1-9][A-Z]?--[0-9]+)?",
})

export default config
