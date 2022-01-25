import readline from "readline"
import stream from "stream"
import ddc from "../config/ddc.js"

/**
 * An async generator that parses an input stream line by line and yields its results.
 *
 * Example:
 * ```js
 * const fileStream = fs.createReadStream(file)
 * const result = []
 * const errorCount = 0
 * for await (const concept of getConceptFromBackend(fileStream)) {
 *   if (concept) {
 *     result.push(concept)
 *   } else {
 *     errorCount += 1
 *   }
 * }
 * ```
 *
 * @param {stream|stirng} input input stream of vc_day slim data
 * @param {object} options options object with optional properties `log`, `warn`, `ignoreErrors`
 */
export async function* getConceptFromBackend(input, options = {}) {
  if (typeof input === "string") {
    input = stream.Readable.from([input])
  }
  // Regular expressions
  const startRe = /^([0-9.-]+) \(\S*\)/
  const facetIndicatorRe = /^(\S*) <(Facet Indicator)> \((?:rule: (.*) -> )?(?:facet|notation): (.*)\)/
  const lineRe = /^(\S*) (.*) \((?:rule: (.*) -> )?notation: (.*)\)/
  const endRe = /^\s*$/

  const warn = options.warn || (() => {})

  let current = null
  let currentHasError = false
  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  })
  for await (const line of rl) {
    const startMatch = startRe.exec(line)
    const facetIndicatorMatch = facetIndicatorRe.exec(line)
    const lineMatch = lineRe.exec(line)
    const endMatch = endRe.exec(line)

    if (startMatch) {
      const notation = startMatch[1]
      current = ddc.conceptFromNotation(notation, { inScheme: true })
      current.memberList = []
      currentHasError = false
    } else if (endMatch) {
      if (current) {
        currentHasError = currentHasError || !checkConcept(current, warn)
        if (!currentHasError || options.ignoreErrors) {
          yield current
          current = null
        } else {
          // Yield null values to indicate errors
          yield null
        }
      }
    } else if (!current || (!options.ignoreErrors && currentHasError)) {
      // TODO: How to deal with errors like this?
      // It happens for example in ou_gvk_all18_3c_de_slim-21-05-01 (but where?)
    } else if (facetIndicatorMatch) {
      // Special concept for facet indicator
      const facet = facetIndicatorMatch[4]
      // Uncomment if needed (see https://github.com/gbv/coli-ana/issues/22)
      // const rule = facetIndicatorMatch[3]
      current.memberList.push({
        uri: `http://dewey.info/facet/${facet}`,
        notation: [facet, facetIndicatorMatch[1]],
        prefLabel: { en: "facet indicator", de: "Facettenindikator" },
      })
    } else if (lineMatch) {
      let prefLabel = lineMatch[2]
      // Uncomment if needed (see https://github.com/gbv/coli-ana/issues/22)
      // const rule = lineMatch[3]
      let notation = lineMatch[4]
      // Deal with #dno_span_cen#
      // TODO: Remove this after exported data is fixed.
      if (prefLabel.endsWith("#dno_span_cen#")) {
        prefLabel = prefLabel.replace(" #dno_span_cen#", "")
        // Also remove :xyz from notation
        notation = notation.replace(/:.*/, "")
      }
      const member = ddc.conceptFromNotation(notation)
      if (member) {
        member.prefLabel = { de: prefLabel }
        member.notation.push(lineMatch[1])
        current.memberList.push(member)
      } else {
        warn(`Warning: Could not convert DDC notation ${notation}`)
      }
    } else {
      warn(`Warning: Could not parse line ${line}`)
    }
  }
  if (current) {
    currentHasError = currentHasError || !checkConcept(current, warn)
    if (!currentHasError || options.ignoreErrors) {
      yield current
    } else {
      yield null
    }
  }
}

function checkConcept(concept, warn) {
  const { notation, memberList } = concept

  if (!memberList.length) {
    warn(`Analysis of ${notation} is empty`)
    return
  }

  if (!memberList.every(m => m.notation[1].length === notation[0].length)) {
    warn(`Notation length mismatch in ${notation}`)
    return
  }

  // allow elements two appear twice (could be error) bot not more (is probably error)
  const count = {}
  for(let i=0; i<memberList.length; i++) {
    const id = memberList[i].notation.join(" = ")
    console.log(id)
    count[id] = count[id] || 0
    console.log(count[id])
    if (count[id]++ >= 2) {
      warn(`Error: Unexpected duplicate ${id} in analysis of ${notation})`)
      return
    }
  }

  return true
}
