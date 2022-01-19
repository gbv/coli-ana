<template>
  <div v-if="titles.length">
    <h5>Titles in K10plus catalog</h5>
    <ul style="list-style-type: none; padding-left: 0">
      <li v-for="title of titles">
        <a
          :href="`https://opac.k10plus.de/DB=2.299/PPNSET?PPN=${title.ppn}`"
          target="k10plus"
          title="show in K10plus catalog">
          📚
        </a>
        <span v-html="title.citation" />
      </li>
    </ul>
  </div>
</template>

<script>
import { watch, ref, computed } from "vue"

const inBrowser = typeof window !== "undefined"

export default {
  props: {
    notation: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "en",
    },
    citationstyle: {
      type: String,
      default: "ieee",
    }
  },
  setup(props) {
    const titles = ref({})

    const fetchTitles = async () => {
      const { notation, language, citationstyle } = props
      if (!notation) {
        titles.value = []
        return
      }
      try {
        const url = `https://ws.gbv.de/suggest/csl2?query=pica.ddc=${notation}&citationstyle=${citationstyle}&language=${language}&highlight=1`
        const response = await fetch(url)
        const data = await response.json()
        titles.value = data[1].map((title, i) => {
          const ppn = data[3][i].replace(/^.+:/,'')
          return { citation: title, ppn }
        })
      } catch (error) {
        titles.value = []
        inBrowser && console.warn("Error loading data:", error)
      }
    }

    if (inBrowser) {
      watch(
        () => props,
        async () => { await fetchTitles() },
      )
      fetchTitles()
    }

    return {
      fetchTitles,
      titles
    }
  }
}
</script>
