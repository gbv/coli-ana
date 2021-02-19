import pkg from "../package.json"
const { name, version, description } = pkg
import examples from "../lib/examples.json"
import configMerged from "./config.js"

const config = Object.assign({
  name,
  description,
  examples: Object.keys(examples),
}, configMerged, {
  version,
})

import jskos from "jskos-tools"
config.ddc = new jskos.ConceptScheme({
  uri: "http://dewey.info/scheme/edition/e23/",
  uriPattern: "^http://dewey.info/class/(.+)/e23/$",
  notationPattern: "[0-9][0-9]?|[0-9]{3}(-[0-9]{3})?|[0-9]{3}.[0-9]+(-[0-9]{3}.[0-9]+)?|[1-9][A-Z]?--[0-9]+|[1-9][A-Z]?--[0-9]+(-[1-9][A-Z]?--[0-9]+)?",
})

export default config
