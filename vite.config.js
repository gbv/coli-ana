import "dotenv/config"
import vuePlugin from "@vitejs/plugin-vue"
import config from "./config/config.js"
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import Components from "unplugin-vue-components/vite"

/**
 * `define` performs static replacements of strings.
 * We're using this to replace `process.env` values with the actual values from the environment at build time.
 */
const define = {}
for (let key of Object.keys(process.env)) {
  let value = `${process.env[key]}`
  // Note that we need to surround strings with ""
  if (typeof value === "string" && (!value.startsWith("\"") || !value.endsWith("\""))) {
    value = `"${value.replace(/"/g, "\\\"")}"`
  }
  define[`process.env.${key}`] = value
}
// Some modules use process.browser so we need to define it as well
define["process.browser"] = true
// Fallback for other process.env values (so that process.env.XYZ is undefined)
define["process.env"] = {}

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    vuePlugin(),
    Components({
      resolvers: IconsResolver(),
    }),
    Icons({
      autoInstall: true,
      compiler: "vue3",
      scale: 1.1,
      defaultStyle: "height: 1.375em; vertical-align: bottom;",
    }),
  ],
  build: {
    minify: false,
  },
  define,
  // Use base / for everything other than production
  base: process.env.NODE_ENV === "production" ? config.base : "/",
}
