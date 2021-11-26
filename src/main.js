import App from "./App.vue"
import { createSSRApp } from "vue"
import { createRouter } from "./router"
import { createStore } from "./store"

// Tippy.js for tooltips
import VueTippy from "vue-tippy"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light-border.css"
import { followCursor } from "tippy.js"

// jskos-vue
import "jskos-vue/dist/style.css"
import { ItemName } from "jskos-vue"
import notationPlugin from "./utils/notationPlugin.js"
ItemName.addNotationPlugin(notationPlugin)

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  import.meta.env.SSR && createStore()
  app.use(router)
  app.use(ItemName)
  app.use(VueTippy, {
    defaultProps: {
      theme: "light-border",
      followCursor: "horizontal",
      plugins: [followCursor],
      duration: [275, 100],
      offset: 0,
    },
  })
  return { app, router }
}
