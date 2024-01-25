import jskos from "jskos-tools"

const ddc = new jskos.ConceptScheme({
  uri: "http://dewey.info/scheme/edition/e23/",
  uriPattern: "^http://dewey.info/class/(.+)/e23/$",
  notationPattern: "(([0-9][0-9]?|[0-9]{3}(-[0-9]{3})?|[0-9]{3}\\.[0-9]+(-[0-9]{3}\\.[0-9]+(:[0-9]+)?)?|T[1-9][A-Z]?--[0-9]+(-T[1-9][A-Z]?--[0-9]+(:[0-9]+)?)?|[1-9][A-Z]?--[0-9]+(-[1-9][A-Z]?--[0-9]+(:[0-9]+)?)?)?)",
})

// DDC table numbers start with a 'T' but this letter is omitted in the URI.
ddc._uriFromNotation = ddc.uriFromNotation
ddc.uriFromNotation = notation => ddc._uriFromNotation(notation.replace(/^T/, "").replace(/-T\d[A-C]?-/, ""))

ddc._conceptFromUri = ddc.conceptFromUri
ddc.conceptFromUri = (uri, options={}) => {
  const concept = ddc._conceptFromUri(uri, options)
  if (concept.notation[0].match(/^[1-9][A-Z]?--/)) {
    // TODO: Do we want the short form or the long form? (short: T2--74-79, long: T2--74-T2--79)
    concept.notation[0] = "T" + concept.notation[0]
  }
  return concept
}

export default ddc
