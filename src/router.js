import {
  createMemoryHistory,
  createRouter as _createRouter,
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

export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR ? createMemoryHistory(base) : createWebHistory(base),
    routes,
  })
}
