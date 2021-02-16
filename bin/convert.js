#!/usr/bin/env node

/**
 * Converts coli-ana decompositions to JSKOS
 *
 * npm run convert /path/to/input/file
 *
 * Outputs a JSON object with notations as keys and memberLists as values.
 */

const fs = require("fs")
const readline = require("readline")
const file = process.argv[2]

// Regular expressions
const startRe = /^(\S*) \(\S*\)/
const facetIndicatorRe = /^(\S*) <(Facet Indicator)> \(notation: (.*)\)/
const lineRe = /^(\S*) (.*) \(notation: (.*)\)/
const endRe = /^\s*$/

if (!file) {
  console.error("Error: Please provide input file as first argument.")
  process.exit(1)
}

if (!fs.existsSync(file)) {
  console.error(`Error: File ${file} does not exist.`)
  process.exit(1)
}

const readInterface = readline.createInterface({
  input: fs.createReadStream(file),
})

let result = {}
let current = null
function end() {
  if (current) {
    result[current.notation[0]] = current.memberList
  }
  current = null
}
readInterface.on("line", function (line) {
  const startMatch = startRe.exec(line)
  const facetIndicatorMatch = facetIndicatorRe.exec(line)
  const lineMatch = lineRe.exec(line)
  const endMatch = endRe.exec(line)

  if (startMatch) {
    const notation = startMatch[1]
    current = {
      notation: [notation],
      memberList: [],
    }
  } else if (endMatch) {
    end()
  } else if (facetIndicatorMatch) {
    // Special concept for facet indicator
    current.memberList.push({
      uri: `http://dewey.info/facet/${facetIndicatorMatch[3]}`,
      notation: [facetIndicatorMatch[3], facetIndicatorMatch[1]],
      prefLabel: { en: "facet indicator", de: "Facettenindikator" },
    })
  } else if (lineMatch) {
    current.memberList.push({
      notation: [lineMatch[3], lineMatch[1]],
      prefLabel: { de: lineMatch[2] },
    })
  } else {
    console.warn(`Warning: Could not parse line ${line}`)
  }
})
readInterface.on("close", () => {
  end()
  console.log(JSON.stringify(result, null, 2))
})
