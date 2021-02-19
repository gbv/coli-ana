import vuePlugin from "@vitejs/plugin-vue"
import config from "./config/config.js"

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [
    vuePlugin(),
  ],
  build: {
    minify: false,
  },
  // Use base / for everything other than production
  base: process.env.NODE_ENV === "production" ? config.base : "/",
}
