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
        <h2>DDC Analysis</h2>
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
            <i-mdi-file-tree /> analyze
          </button>
          <span>
            Language:
            <span
              v-for="(lang, index) in languages"
              :key="lang.id">
              <a
                href=""
                :title="`set DDC caption language to ${lang.label}`"
                :style="{
                  'font-weight': languageList[0] === lang.id ? 'bold' : 'normal',
                }"
                @click.prevent="setCaptionLanguage(lang.id)">
                {{ lang.label }}
              </a><span v-if="index + 1 < languages.length">, </span>
            </span>
          </span>
        </form>
        <div class="examples font-size-small">
          Examples:
          <span
            v-for="(notation, index) in examples"
            :key="notation">
            <router-link
              :to="`/?notation=${notation}`"
              :title="`show analysis for notation ${notation}`">
              <code>{{ notation }}</code>
            </router-link>
            <code v-if="index + 1 < examples.length">, </code>
          </span>
        </div>
        <analyze
          :notation="$route.query.notation" />
      </div>
      <div class="section">
        <h2>Documentation</h2>
        <template v-if="$route.query.notation">
          <p>
            The set of analyzed notations is limited for testing.
          </p>
        </template>
        <p>
            DDC notations are returned in
            <a href="https://format.gbv.de/jskos">JSKOS</a> format
            with field <code>memberList</code> containing DDC elements.
            See <a
            href="https://github.com/gbv/coli-ana"
            target="_blank">GitHub</a> for technical documentation and
            <a
              href="https://coli-conc.gbv.de/coli-ana/"
              target="_blank">the project page</a> for background information.
        </p>
        <p>
          Non-English DDC is licensed by OCLC under <a
            href="https://creativecommons.org/licenses/by-nc-nd/3.0/de/"
            target="_blank">CC BY-NC-ND 3.0</a>.
          <img
            src="/by-nc-nd.svg"
            alt="CC BY-NC-ND Icon">
          Icons by <a
            href="https://github.com/Templarian/MaterialDesign"
            target="_blank">Material Design Icons</a>.
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
import config from "../config/index.js"
import Analyze from "./components/Analyze.vue"
import { cleanupNotation } from "../lib/baseNumber.js"

import { store, languages } from "./store.js"
// Set jskos-tools language
import jskos from "jskos-tools"
jskos.languagePreference.defaults = store.languages

export default {
  components: { Analyze },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const notation = ref(cleanupNotation(route.query.notation))

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

    const search = () => {
      if (notation.value) {
        notation.value = cleanupNotation(notation.value)
        router.push(`/?notation=${notation.value}`)
      } else {
        router.push("/")
      }
    }

    router.afterEach((to) => {
      notation.value = to.query.notation ?? ""
      // Set caption language if necessary
      if (to.query.lang && to.query.lang !== store.languages[0]) {
        setCaptionLanguage(to.query.lang)
      }
      // Set lang parameter in URL if necessary
      if (!to.query.lang && languages[0].id !== store.languages[0]) {
        router.push({ query: { ...route.query, lang: store.languages[0] } })
      }
    })

    return {
      ...config,
      search,
      notation,
      languages,
      languageList: store.languages,
      setCaptionLanguage,
    }
  },
}
</script>

<style>
* {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
:root {
  scrollbar-gutter: stable both-edges;
}
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
form {
  padding: 0.5em;
}
form > * {
  margin-right: 5px;
}
.examples {
  padding-bottom: 0.5em;
  padding-left: 1em;
}
</style>
