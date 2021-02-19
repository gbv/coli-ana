import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from "vue-router"

const routes = [
  {
    path: "/",
    component: () => import("./components/Home.vue"),
  },
  {
    path: "/:notation", // use in template with $route.params.notation
    component: () => import("./components/Decompose.vue"),
  },
]

export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR ? createMemoryHistory(import.meta.env.BASE_URL) : createWebHistory(import.meta.env.BASE_URL),
    routes,
  })
}
