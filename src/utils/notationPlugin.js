import jskos from "jskos-tools"

export default (notation, { item }) => {

  // Fix notations for table ranges
  if (notation) {
    notation = notation.replace(/^(T[1-9][A-Z]?--)(.*)-(.*)$/, "$1$2-$1$3")
  }

  // For DDC and SDNB only: fill number notation with trailing zeros
  let fill = ""
  if (jskos.compare({
    uri: "http://dewey.info/scheme/edition/e23/",
    identifier: [
      "http://bartoc.org/en/node/241",
      "http://bartoc.org/en/node/18497",
      "http://www.wikidata.org/entity/Q67011877",
      "http://id.loc.gov/vocabulary/classSchemes/sdnb",
      "http://uri.gbv.de/terminology/sdnb",
    ],
  }, item.inScheme && item.inScheme[0]) && !isNaN(parseInt(notation))) {
    while (notation.length + fill.length < 3) {
      fill += "0"
    }
  }
  if (fill.length) {
    // Using the shared `jskos-vue-text-lightGrey` CSS class
    notation += `<span class='jskos-vue-text-lightGrey'>${fill}</span>`
  }

  return notation
}
