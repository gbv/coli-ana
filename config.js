const { name, version, description } = require("./package.json")
const examples = require("./lib/examples.json")

const config = {
  name,
  version,
  description,
  port: 11033, // octal 025431 (025.431=Dewey Decimal Classification)
  examples: Object.keys(examples),
  cocoda: "https://coli-conc.gbv.de/cocoda/app/"
}

const { ConceptScheme } = require("jskos-tools")
config.ddc = new ConceptScheme({
  uri: "http://dewey.info/scheme/edition/e23/",
  uriPattern: "^http://dewey.info/class/(.+)/e23/$",
  notationPattern: "[0-9][0-9]?|[0-9]{3}(-[0-9]{3})?|[0-9]{3}.[0-9]+(-[0-9]{3}.[0-9]+)?|[1-9][A-Z]?--[0-9]+|[1-9][A-Z]?--[0-9]+(-[1-9][A-Z]?--[0-9]+)?"
})

module.exports = config
