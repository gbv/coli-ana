#!/usr/bin/env node

import fs from "fs"
import prisma from "../lib/prisma.js"
import { picaFromDDC } from "../lib/pica.js"
import { parseInputStream } from "../lib/parseInputStream.js"

// Basic argument parsing
const args = process.argv.slice(2)
const files = args.filter(arg => !arg.startsWith("--"))
const shouldImport = args.includes("--import")
const shouldReset = args.includes("--reset") && shouldImport
const quiet = args.includes("--quiet")
const ignoreErrors = args.includes("--ignore-errors")
const picaFormat = args.includes("--pica")
const help = args.includes("--help")

if (help || !args.length) {
  console.log(`
node ./bin/convert.js {options} input-files...

Converts coli-ana decompositions to JSKOS. By default, prints result
as JSKOS concepts, each including the "memberList" property.

Options:
  --import  import directly into the database
  --reset   clear database (by default, only new decompositions are added)
  --quiet   suppress error output for individual records during import
	    (it will still show general errors and statistics)
  --pica    output PICA/JSON as ndjson. For PICA/Plain pass to
	    picadata -f json -t plain`)
  process.exit(0)
}

const log = (...args) => {
  shouldImport && console.log(...args)
}
const warn = (...args) => {
  shouldImport && !quiet && console.warn(...args)
}

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
    log(`Deleted ${count} records.`)
  }

  let result = []
  let totalAdded = 0
  let totalErrors = 0

  async function processResults() {
    if (shouldImport) {
      const transaction = await prisma.$transaction([
        prisma.data.deleteMany({
          where: {
            uri: {
              in: result.map(r => r.uri),
            },
          },
        }),
        prisma.data.createMany({
          data: result,
          skipDuplicates: true,
        }),
      ])
      const count = transaction[1].count
      log(`Added ${count} records.`)
      totalAdded += count
      result = []
    } else {
      result.forEach(item => {
        if (picaFormat) {
          item = picaFromDDC(item)
        }
        console.log(JSON.stringify(item))
      })
      result = []
    }
  }

  for (let file of files) {
    log(`Reading file ${file}...`)
    const fileStream = fs.createReadStream(file)
    for await (const concept of parseInputStream(fileStream, { log, warn, ignoreErrors })) {
      if (concept) {
        result.push(concept)
        // Process in batches of 25k results
        if (result.length >= 25000) {
          await processResults()
        }
      } else {
        totalErrors += 1
      }
    }
  }
  await processResults()
  log(`Import completed. Added ${totalAdded} records in total. ${totalErrors} records had an error and were ${ignoreErrors ? "not " : ""}skipped${ignoreErrors ? " (--ignore-errors was given)" : ""}.`)

  await prisma.$disconnect()

})()
