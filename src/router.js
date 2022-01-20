import {
  createRouter,
  createWebHistory,
} from "vue-router"

const routes = [
  {
    path: "/",
    component: () => import("./components/Analyze.vue"),
  },
]

let base = import.meta.env.BASE_URL
if (base.endsWith("/")) {
  base = base.substring(0, base.length - 1)
}

export default createRouter({
  history: createWebHistory(base),
  routes,
})
