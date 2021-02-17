<template>
  <div>
    <header>
      <router-link to="/">
        Home
      </router-link>
    </header>
    <h1>coli-ana</h1>
    <h2>Decomposition</h2>
    <p>You can decompose DDC numbers here (separate multiple numbers via <code>|</code>).</p>
    <form
      @submit.prevent="submit">
      <input
        v-model="notation"
        type="text">
      <button type="submit">
        Decompose
      </button>
    </form>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
    <h2>Documentation</h2>
    <p>
      Visit <a
        href="https://coli-conc.gbv.de/coli-ana/"
        target="_blank">the project page</a> for background information or
      <a
        href="https://github.com/gbv/coli-ana-api"
        target="_blank">GitHub</a> for technical documentation.
    </p>
    <footer>
      {{ name }} version {{ version }}
    </footer>
  </div>
</template>

<script>
import { useRouter, useRoute } from "vue-router"
import config from "./config"

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    const submit = (e) => {
      router.push(`/${e.srcElement[0].value}`)
    }
    return {
      ...config,
      submit,
      notation: route.params.notation,
    }
  },
}
</script>

<style>
/* page styles */
#app {
  max-width: 70ch;
  padding: 2ch;
  margin: auto;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
/* link styles */
a {
  text-decoration: none;
  color: #ff3c3c;
}
a:hover, a:active {
  text-decoration: underline;
}
/* table styles */
table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
}
table thead tr {
  color: #ffffff;
  text-align: left;
}
table th,
table td {
  padding: 12px 15px;
}
table tbody tr {
  border-bottom: 1px solid #dddddd;
}
table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}
</style>
