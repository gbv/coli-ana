// In the browser, we're using Vite's `define` to inject the contents of package.json here.
const { name, version, description } = process.pkg
const examples = process.examples
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
