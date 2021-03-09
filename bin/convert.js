#!/usr/bin/env node

/**
 * Converts coli-ana decompositions to JSKOS. By default, prints out the result as JSON. Use with --import to import directly into the database. Add --reset to also clear the database (by default, only new decompositions will be added).
 *
 * node ./bin/convert.js [--import] [--reset] /path/to/input/file [/path/to/input/file|...]
 *
 * Outputs a JSON array with JSKOS concepts, each including the "memberList" property.
 */

import fs from "fs"
import readline from "readline"
import stream from "stream"
import prisma from "../lib/prisma.js"
import ddc from "../config/ddc.js"

// async readline, see https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
function readLines({ input }) {
  const output = new stream.PassThrough({ objectMode: true })
  const rl = readline.createInterface({ input })
  rl.on("line", line => {
    output.write(line)
  })
  rl.on("close", () => {
    output.push(null)
  })
  return output
}

// Basic argument parsing
const args = process.argv.slice(2)
const files = args.filter(arg => !arg.startsWith("--"))
const shouldImport = args.includes("--import")
const shouldReset = args.includes("--reset")

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
  function end() {
    if (current) {
      result.push(current)
    }
    current = null
  }

  for (let file of files) {
    const input = fs.createReadStream(file)
    for await (const line of readLines({ input })) {
      const startMatch = startRe.exec(line)
      const facetIndicatorMatch = facetIndicatorRe.exec(line)
      const lineMatch = lineRe.exec(line)
      const endMatch = endRe.exec(line)

      if (startMatch) {
        const notation = startMatch[1]
        current = ddc.conceptFromNotation(notation, { inScheme: true })
        current.memberList = []
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
        const notation = lineMatch[3]
        const member = ddc.conceptFromNotation(notation)
        if (member) {
          member.prefLabel = { de: lineMatch[2] }
          member.notation.push(lineMatch[1])
          current.memberList.push(member)
        } else {
          console.warn(`Warning: Could not convert DDC notation ${lineMatch[3]}`)
        }
      } else {
        console.warn(`Warning: Could not parse line ${line}`)
      }
    }
    end()
  }

  if (shouldImport) {
    const createMany = await prisma.data.createMany({
      data: result,
      skipDuplicates: true,
    })
    console.log(`Added ${createMany.count} records.`)
  } else {
    // TODO: Adjust output format
    console.log(JSON.stringify(result, null, 2))
  }

  await prisma.$disconnect()

})()
