import readline from "readline"
import stream from "stream"
import config from "../config/config.js"
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
 * @param {object} options options object with optional property `ignoreErrors`
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
        currentHasError = currentHasError || !checkConcept(current)
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
        // Workaround for bug in jskos-tools that doesn't deal correctly with : in notations
        member.uri = member.uri.replace("%3A", ":")
        member.notation[0] = member.notation[0].replace("%3A", ":")
        member.prefLabel = { de: prefLabel }
        member.notation.push(lineMatch[1])
        current.memberList.push(member)
      } else {
        config.log(`Warning: Could not convert DDC notation ${notation}`)
      }
    } else {
      config.log(`Warning: Could not parse line ${line}`)
    }
  }
  if (current) {
    currentHasError = currentHasError || !checkConcept(current)
    if (!currentHasError || options.ignoreErrors) {
      yield current
    } else {
      yield null
    }
  }
}

function checkConcept(concept) {
  const { notation, memberList } = concept

  if (!memberList.length) {
    config.log(`Analysis of ${notation} is empty`)
    return
  }

  if (!memberList.every(m => m.notation[1].length === notation[0].length)) {
    config.log(`Notation length mismatch in ${notation}`)
    return
  }

  // allow elements to appear twice (could be error) but not more (is probably error)
  const count = {}
  for (const member of memberList.filter(Boolean)) {
    const id = member.notation.join(" = ")
    count[id] = count[id] || 0
    if (count[id]++ >= 2) {
      // Add `null` member to indicate an error in the analysis
      if (!memberList.includes(null)) {
        memberList.push(null)
      }
    }
  }

  return true
}
