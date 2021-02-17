<template>
  <div>
    <header>
      <router-link to="/">
        Home
      </router-link>
    </header>
    <h1>coli-ana</h1>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
    <footer>
      {{ name }} version {{ version }}
    </footer>
  </div>
</template>

<script>
import config from "./config"

export default {
  async setup() {
    return {
      ...config,
    }
  },
}
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
#app {
  margin: 20px;
}
a:link, a:visited {
  text-decoration: none;
  color: rgb(96, 143, 219);
}
a:hover, a:active {
  text-decoration: underline;
}
table, td, th {
  border: 1px solid;
}
</style>
