import pkg from "../package.json"
const { name, version, description } = pkg
import examples from "../lib/examples.json"
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
