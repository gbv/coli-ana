import vuePlugin from "@vitejs/plugin-vue"

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
}
