import { createRequire } from "module"
const require = createRequire(import.meta.url)
const pkg = require("../package.json")
const { name, version, description } = pkg
const examples = require("../lib/examples.json")
import configMerged from "./config.js"
import ddc from "./ddc.js"

const config = Object.assign({
  name,
  description,
  examples: Object.keys(examples),
}, configMerged, {
  version,
  ddc,
})

export default config
