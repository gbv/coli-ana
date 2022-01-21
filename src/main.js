import App from "./App.vue"
import { createApp } from "vue"
import router from "./router"

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

const app = createApp(App)

app.use(router)
app.use(ItemName)
app.use(VueTippy, {
  defaultProps: {
    theme: "light-border",
    followCursor: "horizontal",
    plugins: [followCursor],
    duration: [275, 100],
    delay: [300, 0],
    offset: 0,
  },
})

app.mount("#app")
