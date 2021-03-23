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
        <h2>Analysis</h2>
        <p>You can analyze one or more synthesized DDC numbers here (separated via <code>|</code>).</p>
        <form
          @submit.prevent="submit">
          <input
            v-model="notation"
            type="text">
          <button
            class="button"
            title="analyzes DDC number(s)"
            name="analyze"
            type="submit">
            ⚛️ analyze
          </button>
          <button
            class="button"
            title="performs a lookup of DDC number in analysis results"
            name="lookup"
            type="submit">
            🔍 lookup
          </button>
          <p>
            Examples:
            <span
              v-for="(notation, index) in examples"
              :key="notation">
              <router-link :to="`/?notation=${notation}`">
                <code>{{ notation }}</code>
              </router-link>
              <code v-if="index + 1 < examples.length">, </code>
            </span>
            (the service is limited to a set of notations for testing)
          </p>
        </form>
        <analyze
          :notation="$route.query.notation"
          :mode="$route.query.mode" />
      </div>
      <div class="section">
        <h2>Documentation</h2>
        <p>
          Non-English DDC is licensed by OCLC under <a href="https://creativecommons.org/licenses/by-nc-nd/3.0/de/">CC-NC-ND 3.0</a>.
        </p>
        <template v-if="$route.query.notation">
          <p>
            Format documentation:
            <a href="https://format.gbv.de/jskos">JSKOS</a> ・
            <a href="https://format.gbv.de/pica/json">PICA/JSON</a> ・
            <a href="https://format.gbv.de/pica/plain">PICA Plain</a>
          </p>
          <p>
            The set of analyzed notations is limited for testing.
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
import Analyze from "./components/Analyze.vue"

export default {
  components: { Analyze },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const notation = ref(route.query.notation)
    const mode = ref(route.query.mode)

    const submit = (e) => {
      const notation = e.srcElement[0].value
      if (notation) {
        router.push(`/?notation=${notation}&mode=${e.submitter.name}`)
      } else {
        router.push("/")
      }
    }

    router.afterEach((to) => {
      notation.value = to.query.notation ?? ""
      mode.value = to.query.mode ?? ""
    })

    return {
      ...config,
      submit,
      notation,
      mode,
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
code {
  font-weight: 500;
}
input {
  padding: calc(3px + 4 * ((100vw - 300px) / 1300)) 5px;
  border-radius: 5px;
  border-width: 1px;
}
form > * {
  margin-right: 5px;
}
</style>
