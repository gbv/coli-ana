import App from "./App.vue"
import { createSSRApp } from "vue"
import { createRouter } from "./router"

// Tippy.js for tooltips
import VueTippy from "vue-tippy"
import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light-border.css"
import { followCursor } from "tippy.js"

// jskos-vue
import jskos from "jskos-tools"
import "jskos-vue/dist/style.css"
import { ItemName } from "jskos-vue"
ItemName.addNotationPlugin((notation, { item }) => {
  let fill = ""
  // For DDC and SDNB only: fill number notation with trailing zeros
  if (jskos.compare({
    uri: "http://dewey.info/scheme/edition/e23/",
    identifier: [
      "http://bartoc.org/en/node/241",
      "http://bartoc.org/en/node/18497",
      "http://www.wikidata.org/entity/Q67011877",
      "http://id.loc.gov/vocabulary/classSchemes/sdnb",
      "http://uri.gbv.de/terminology/sdnb",
    ],
  }, item.inScheme && item.inScheme[0]) && !isNaN(parseInt(notation))) {
    while (notation.length + fill.length < 3) {
      fill += "0"
    }
  }
  if (fill.length) {
    // Using the shared `jskos-vue-text-lightGrey` CSS class
    notation += `<span class='jskos-vue-text-lightGrey'>${fill}</span>`
  }
  return notation
})

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
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
