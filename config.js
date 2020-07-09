const { name, version, description } = require("./package.json")
const port = 11033 // octal 025431 (025.431=Dewey Decimal Classification)
const examples = ["700.90440747471"]
const cocoda = "https://coli-conc.gbv.de/cocoda/app/"

const { ConceptScheme } = require("jskos-tools")

const ddc = new ConceptScheme({
  uri: "http://dewey.info/scheme/edition/e23/",
  uriPattern: "^http://dewey.info/class/(.+)/e23/$",
  notationPattern: "[0-9][0-9]?|[0-9]{3}(-[0-9]{3})?|[0-9]{3}.[0-9]+(-[0-9]{3}.[0-9]+)?|[1-9][A-Z]?--[0-9]+|[1-9][A-Z]?--[0-9]+(-[1-9][A-Z]?--[0-9]+)?"
})

module.exports = { name, version, description, cocoda, ddc, port, examples }
