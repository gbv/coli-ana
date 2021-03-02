import "dotenv/config.js"
import vuePlugin from "@vitejs/plugin-vue"
import config from "./config/config.js"

import stripCode from "rollup-plugin-strip-code"

// Define all process.env values separately
const define = {}
for (let key of Object.keys(process.env)) {
  let value = `${process.env[key]}`
  // Note that we need to surround strings with ""
  if (typeof value === "string" && (!value.startsWith("\"") || !value.endsWith("\""))) {
    value = `"${value}"`
  }
  define[`process.env.${key}`] = value
}

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    vuePlugin(),
  ],
  build: {
    minify: false,
    rollupOptions: {
      plugins: [
        stripCode({
          start_comment: "rollup-remove-start",
          end_comment: "rollup-remove-end",
        }),
      ],
    },
  },
  // Use base / for everything other than production
  base: process.env.NODE_ENV === "production" ? config.base : "/",
  define,
}
