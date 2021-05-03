#!/usr/bin/env node

/**
 * Converts coli-ana decompositions to JSKOS. By default, prints out the result as JSON. Use with --import to import directly into the database. Add --reset to also clear the database (by default, only new decompositions will be added). Add --quiet to suppress error outputs for individual records during import (it will still show general errors like missing files, and how many records were imported/deleted).
 *
 * node ./bin/convert.js [--import] [--reset] [--quiet] [--pica] /path/to/input/file [/path/to/input/file|...]
 *
 * Outputs JSKOS concepts as ndjson, each including the "memberList" property.
 * Outputs PICA/JSON as ndjson if option --pica was given (pass to `picadata -f json -t plain` for PICA/Plain).
 */

import fs from "fs"
import readline from "readline"
import prisma from "../lib/prisma.js"
import ddc from "../config/ddc.js"
import { picaFromDDC } from "../lib/pica.js"

// Basic argument parsing
const args = process.argv.slice(2)
const files = args.filter(arg => !arg.startsWith("--"))
const shouldImport = args.includes("--import")
const shouldReset = args.includes("--reset")
const quiet = args.includes("--quiet")
const picaFormat = args.includes("--pica")

// Regular expressions
const startRe = /^(\S*) \(\S*\)/
const facetIndicatorRe = /^(\S*) <(Facet Indicator)> \(notation: (.*)\)/
const lineRe = /^(\S*) (.*) \(notation: (.*)\)/
const endRe = /^\s*$/

if (!files.length) {
  console.error("Error: Please provide input file(s).")
  process.exit(1)
}

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`Error: File ${file} does not exist, exiting...`)
    process.exit(1)
  }
});

(async () => {

  if (shouldReset) {
    const { count } = await prisma.data.deleteMany()
    console.log(`Deleted ${count} records.`)
  }

  let result = []
  let current = null
  let totalAdded = 0

  async function end(forceProcess = false) {
    if (current) {
      result.push(current)
    }
    current = null
    // Process every 50k results
    if (forceProcess || result.length >= 50000) {
      if (shouldImport) {
        const createMany = await prisma.data.createMany({
          data: result,
          skipDuplicates: true,
        })
        console.log(`Added ${createMany.count} records.`)
        totalAdded += createMany.count
        result = []
      } else {
        result.forEach(item => {
          if (picaFormat) {
            item = picaFromDDC(item)
          }
          console.log(JSON.stringify(item))
        })
      }
    }
  }

  for (let file of files) {
    console.log(`Reading file ${file}...`)
    const fileStream = fs.createReadStream(file)
    const rl = readline.createInterface({
      input: fileStream,
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
      } else if (!current) {
        // TODO: How to deal with errors like this?
        // It happens for example in ou_gvk_all18_3c_de_slim-21-05-01 (but where?)
      } else if (endMatch) {
        await end()
      } else if (facetIndicatorMatch) {
        // Special concept for facet indicator
        current.memberList.push({
          uri: `http://dewey.info/facet/${facetIndicatorMatch[3]}`,
          notation: [facetIndicatorMatch[3], facetIndicatorMatch[1]],
          prefLabel: { en: "facet indicator", de: "Facettenindikator" },
        })
      } else if (lineMatch) {
        let prefLabel = lineMatch[2]
        let notation = lineMatch[3]
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
          !quiet && console.warn(`Warning: Could not convert DDC notation ${lineMatch[3]}`)
        }
      } else {
        !quiet && console.warn(`Warning: Could not parse line ${line}`)
      }
    }
    await end()
  }
  await end(true)
  if (shouldImport) {
    console.log(`Import completed. Added ${totalAdded} records in total.`)
  }

  await prisma.$disconnect()

})()
