import App from "./App.vue"
import { createSSRApp } from "vue"
import { createRouter } from "./router"

// Tippy.js for tooltips
import VueTippy from "vue-tippy"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light-border.css"

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  app.use(router)
  app.use(VueTippy, {
    defaultProps: {
      placement: "right",
      theme: "light-border",
    },
  })
  return { app, router }
}
