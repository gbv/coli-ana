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
        <p>You can analyze a synthesized DDC numbers here:</p>
        <form
          @submit.prevent="search()">
          <input
            v-model="notation"
            type="text">
          <button
            class="button"
            title="analyzes DDC number"
            name="analyze"
            @click.prevent.stop="search()">
            ⚛️ analyze
          </button>
          <span>
            Language:
            <span
              v-for="(lang, index) in languages"
              :key="lang.id">
              <a
                href=""
                :style="{
                  'font-weight': languageList[0] === lang.id ? 'bold' : 'normal',
                }"
                @click.prevent="setCaptionLanguage(lang.id)">
                {{ lang.label }}
              </a><span v-if="index + 1 < languages.length">, </span>
            </span>
          </span>
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
          </p>
        </form>
        <analyze
          :notation="$route.query.notation"
          :mode="$route.query.mode"
          :page="parseInt($route.query.page) || 1" />
      </div>
      <div class="section">
        <h2>Documentation</h2>
        <template v-if="$route.query.notation">
          <p>
            Format documentation:
            <a href="https://format.gbv.de/jskos">JSKOS</a>,
            <a href="https://format.gbv.de/pica/json">PICA/JSON</a>,
            <a href="https://format.gbv.de/pica/plain">PICA Plain</a>.
            PICA format is limited to <a
              href="https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard"
              target="_blank">field 045H/20-49</a> in <a
                href="https://format.gbv.de/pica/k10plus"
                target="_blank">K10Plus format</a>.
          </p>
          <p>
            The set of analyzed notations is limited for testing.
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
        <p>
          Non-English DDC is licensed by OCLC under <a href="https://creativecommons.org/licenses/by-nc-nd/3.0/de/">CC BY-NC-ND 3.0</a>.
          <img
            src="/by-nc-nd.svg"
            alt="CC BY-NC-ND Icon">
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

import { store, languages } from "./store.js"
// Set jskos-tools language
import jskos from "jskos-tools"
jskos.languagePreference.defaults = store.languages

export default {
  components: { Analyze },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const notation = ref(route.query.notation)
    const mode = ref(route.query.mode)

    const setCaptionLanguage = (id) => {
      store.languages.sort((a, b) => a === id ? -1 : b === id ? 1 : 0)
      if (route.query.lang === id) {
        return
      }
      if (languages[0].id !== id) {
        // Set lang parameter in URL
        router.push({ query: { ...route.query, lang: id } })
      } else {
        // Remove lang parameter from URL
        router.push({ query: { ...route.query, lang: undefined } })
      }
    }
    // Adjust language from query params if necessary
    if (route.query.lang && route.query.lang !== store.languages[0]) {
      setCaptionLanguage(route.query.lang)
    }

    const search = (mode = "analyze") => {
      if (notation.value) {
        router.push(`/?notation=${notation.value}&mode=${mode}`)
      } else {
        router.push("/")
      }
    }

    router.afterEach((to) => {
      notation.value = to.query.notation ?? ""
      mode.value = to.query.mode ?? ""
      // Set lang parameter in URL if necessary
      if (!to.query.lang && languages[0].id !== store.languages[0]) {
        router.push({ query: { ...route.query, lang: store.languages[0] } })
      }
    })

    return {
      ...config,
      search,
      notation,
      mode,
      languages,
      languageList: store.languages,
      setCaptionLanguage,
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
