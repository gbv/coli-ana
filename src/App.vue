<template>
  <div>
    <header class="header">
      <a
        href="https://coli-conc.gbv.de/"
        class="coli-conc-logo-small">
        <img
          src="https://coli-conc.gbv.de/images/coli-conc.svg"
          alt="coli-conc Logo">
      </a>
      <ul class="menu">
        <li>
          <a
            href="https://coli-conc.gbv.de/coli-ana/"
            title="Go to coli-conc website">
            ⬅ back to coli-conc website
          </a>
        </li>
      </ul>
      <div style="clear:both" />
    </header>
    <main id="main">
      <div class="text-center">
        <h1>coli-ana</h1>
      </div>
      <div class="section">
        <h2>Decomposition</h2>
        <p>You can analyze one or more synthesized DDC numbers here (separated via <code>|</code>).</p>
        <form
          @submit.prevent="submit">
          <input
            v-model="notation"
            type="text">
          <button type="submit">
            Decompose
          </button>
          <p>
            Examples:
            <span
              v-for="(notation, index) in examples"
              :key="notation">
              <router-link :to="`/${notation}`">
                <code>{{ notation }}</code>
              </router-link>
              <code v-if="index + 1 < examples.length">, </code>
            </span>
          </p>
        </form>

        <router-view v-slot="{ Component }">
          <Suspense>
            <component :is="Component" />
          </Suspense>
        </router-view>
      </div>
      <div class="section">
        <h2>Documentation</h2>
        <template v-if="$route.params.notation">
          <p>
            Format documentation:
            <a href="https://format.gbv.de/jskos">JSKOS</a> ・
            <a href="https://format.gbv.de/pica/json">PICA/JSON</a> ・
            <a href="https://format.gbv.de/pica/plain">PICA Plain</a>
          </p>
          <p>
            PICA format is limited to <a
              href="https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard"
              target="_blank">field 045H/00</a> in <a
                href="https://format.gbv.de/pica/k10plus"
                target="_blank">K10Plus format</a>.
          </p>
        </template>
        <p>
          Visit <a
            href="https://coli-conc.gbv.de/coli-ana/"
            target="_blank">the project page</a> for background information or
          <a
            href="https://github.com/gbv/coli-ana"
            target="_blank">GitHub</a> for technical documentation.
        </p>
      </div>
    </main>
    <footer class="footer">
      {{ name }} version {{ version }}
    </footer>
  </div>
</template>

<script>
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import config from "../config"

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const notation = ref(route.params.notation)

    const submit = (e) => {
      router.push(`/${e.srcElement[0].value}`)
    }

    router.afterEach((to) => {
      notation.value = to.params.notation ?? ""
    })

    return {
      ...config,
      submit,
      notation,
    }
  },
}
</script>

<style>
/* Use desktop style for header always (since there's only one menu item) */
.header ul, .menu-icon {
  margin-top: 10px;
}
.header .menu {
  clear: none;
  float: right;
  max-height: none;
}
</style>
