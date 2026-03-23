<template>
  <div id="app">
    <header class="header">
      <div class="coli-conc-logo-small">
        <img src="https://coli-conc.gbv.de/images/coli-conc.svg" alt="coli-conc Logo">
      </div>
      <ul class="menu">
        <li>
          <a href="https://coli-conc.gbv.de/coli-ana/" title="Go to coli-ana website">
            ⬅ back to coli-ana website
          </a>
        </li>
      </ul>
      <div style="clear:both" />
    </header>
    <main id="main">
      <div class="text-center">
        <h1>coli-ana</h1>
        <div class="service">
          <span>Service provided by</span>
          <a href="https://en.gbv.de/informations/Verbundzentrale-en" target="_blank" rel="noopener">
            <img :src="vzg" alt="VZG Logo" class="vzg-logo">
          </a>
        </div>
        <p class="subtitle">A Tool for Analyzing and Decomposing Synthesized DDC- Notations/Numbers</p>
      </div>
      <div class="section">
        <div class="analysis-box">
          <div class="analysis-header">
            <h2>DDC Notations</h2>
            <form @submit.prevent="search()" class="analysis-form">
              <input v-model="notation" type="text" />

              <button class="button" title="analyzes DDC number" name="analyze" @click.prevent.stop="search()">
                <i-mdi-file-tree />
                Analyze
              </button>

            </form>
            <span class="language-label">
              Language:
              <span v-for="(lang, index) in languages" :key="lang.id">
                <a href="" :title="`set DDC caption language to ${lang.label}`" :style="{
                  'font-weight': languageList[0] === lang.id ? 'bold' : 'normal',
                }" @click.prevent="setCaptionLanguage(lang.id)">
                  {{ lang.label }}
                </a>
                <span v-if="index + 1 < languages.length">, </span>
              </span>
            </span>

          </div>

          <div class="examples font-size-small">
            Try an example:
            <span v-for="(notation_, index) in examples" :key="notation_">
              <router-link :to="`/?notation=${notation_}`" :title="`show analysis for notation ${notation_}`">
                <code>{{ notation_ }}</code>
              </router-link>
              <code v-if="index + 1 < examples.length">, </code>
            </span>
          </div>

        </div>

        <analyze :notation="$route.query.notation" />

      </div>

      <div class="section">
        <h2>Documentation</h2>
        <p>
          DDC notations are returned in
          <a href="https://format.gbv.de/jskos">JSKOS</a> format
          with field <code>memberList</code> containing DDC elements.
          See <a href="https://github.com/gbv/coli-ana" target="_blank">GitHub</a> for technical documentation and
          <a href="https://coli-conc.gbv.de/coli-ana/" target="_blank">the project page</a> for background information.
        </p>
        <p>
          Non-English DDC is licensed by OCLC under <a href="https://creativecommons.org/licenses/by-nc-nd/3.0/de/"
            target="_blank">CC BY-NC-ND 3.0</a>.
          <img src="/by-nc-nd.svg" alt="CC BY-NC-ND Icon">
          Icons by <a href="https://github.com/Templarian/MaterialDesign" target="_blank">Material Design Icons</a>.
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
import vzg from "./assets/vzg.png"
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
      vzg,
    }
  },
}
</script>

<style>
* {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

html,
body {
  height: 100%;
  margin: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.coli-conc-logo-small img {
  height: 74px !important;
  width: auto !important;
}

.menu a {
  font-size: 19px;
}

.text-center h1 {
  font-size: 45px;
}

.service {
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
}

.vzg-logo {
  height: 38px;
  width: auto;
}

main {
  flex: 1;
}

.header ul,
.menu-icon {
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

.subtitle {
  font-size: 25px;
  font-weight: 700;
  margin-top: 60px;
}

form {
  padding: 0.5em;
}

form>* {
  margin-right: 5px;
}

.analysis-box {
  border: 1px solid #e6e0e0;
  border-radius: 8px;
  padding: 40px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  max-width: 1100px;
  margin: 24px auto;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #b13f13;
}

.analysis-header h2 {
  font-size: 25px;
  margin: 0;
  white-space: nowrap;
}

.analysis-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.analysis-form input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 0.8px solid black;
  border-radius: 6px;
}

.analysis-form .button {
  height: 42px;
  padding: 0 30px;
  border-radius: 50px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.language-label {
  color: #000;
}

.examples {
  padding-top: 10px;
  padding-bottom: 8px;
  font-size: 16px;
}

.section {
  margin-top: 80px;
}

.section p {
  font-size: 20px;
}

@media (max-width: 720px) {
  .coli-conc-logo-small img {
    height: 54px !important;
  }

  .analysis-header {
    flex-wrap: wrap;
    align-items: stretch;
  }

  .analysis-header h2 {
    width: 100%;
    white-space: normal;
    margin-bottom: 8px;
    font-size: 20px;
  }

  .analysis-form {
    width: 100%;
    flex: 1 1 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .analysis-form input {
    width: 100%;
    flex: none;
    min-width: auto;
  }

  .analysis-form .button {
    width: 100%;
    flex: 0 0 auto;
  }

  .service {
    flex-direction: column;
    gap: 8px;
  }

  .vzg-logo {
    height: 35px;
  }
}

@media (max-width: 900px) {
  header.header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  header.header .coli-conc-logo-small {
    width: 100%;
    padding: 10px 16px 0 16px;
  }

  header.header ul.menu {
    width: 100%;
    margin: 8px 0 0 0;
    padding: 0;
    list-style: none;
    text-align: center;
    float: none;
  }

  header.header ul.menu li {
    width: 100%;
  }

  header.header ul.menu a {
    font-size: 15px;
    display: inline-block;
  }
}
</style>
