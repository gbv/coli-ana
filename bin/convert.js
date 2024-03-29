#!/usr/bin/env node

import fs from "fs"
import { getConceptFromBackend } from "../lib/backend.js"

// Basic argument parsing
const args = process.argv.slice(2)
const files = args.filter(arg => !arg.startsWith("--"))
const quiet = args.includes("--quiet")
const ignoreErrors = args.includes("--ignore-errors")
const help = args.includes("--help")

if (help || !args.length) {
  console.log(`
node ./bin/convert.js {options} input-files...

Converts coli-ana decompositions to JSKOS. By default, prints result
as JSKOS concepts, each including the "memberList" property.`)
  process.exit(0)
}

// TODO: Should it even be possible to get an output? What if there are errors?
const shouldImport = false
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

  let result = []
  let totalAdded = 0
  let totalErrors = 0

  async function processResults() {
    result.forEach(item => {
      console.log(JSON.stringify(item))
    })
    result = []
  }

  for (let file of files) {
    log(`Reading file ${file}...`)
    const fileStream = fs.createReadStream(file)
    for await (const concept of getConceptFromBackend(fileStream, { log, warn, ignoreErrors })) {
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

})()
