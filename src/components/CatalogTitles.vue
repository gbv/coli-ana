<template>
  <div v-if="titles.length">
    <ul style="list-style-type: none; padding-left: 0">
      <li
        class="citation"
        v-for="title of titles.filter(Boolean)"
        :key="title.ppn">
        <a
          :href="`https://opac.k10plus.de/DB=2.299/PPNSET?PPN=${title.ppn}`"
          target="k10plus"
          title="show in K10plus catalog">
          <i-mdi-file />
        </a>
        <span v-html="title.citation" />
      </li>
      <li v-if="additionalPagesAvailable">
        <a
          href=""
          @click.prevent="loadMore">
          load more...
        </a>
      </li>
      <li v-if="titles.includes(null)">
        <loading-spinner size="sm" />
      </li>
    </ul>
  </div>
</template>

<script>
import { watch, ref, computed } from "vue"
import linkifyStr from "linkify-string"
import LoadingSpinner from "./LoadingSpinner.vue"

export default {
  components: { LoadingSpinner },
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
    },
  },
  setup(props) {
    const titles = ref([null])
    const additionalPages = ref(0)
    const additionalPagesAvailable = ref(false)
    const count = computed(() => 11 + additionalPages.value * 10)

    const fetchTitles = async () => {
      const { notation, language, citationstyle } = props
      if (!notation) {
        titles.value = []
        return
      }
      try {
        titles.value.push(null)
        const url = `https://ws.gbv.de/suggest/csl2?query=pica.ddc=${notation}&citationstyle=${citationstyle}&language=${language}&highlight=1&database=opac-de-627&count=${count.value}`
        const response = await fetch(url)
        const data = await response.json()
        // Request loaded one more than shown (see slice below); if there's more, show "load more" button
        additionalPagesAvailable.value = data[1].length === count.value
        titles.value = data[1].slice(0, additionalPagesAvailable.value ? -1 : data[1].length).map((title, i) => {
          const ppn = data[3][i].replace(/^.+:/,"")
          const citation = linkifyStr(title, { target: "_blank" })
          return { citation, ppn }
        })
      } catch (error) {
        titles.value = []
        console.warn("Error loading data:", error)
      }
    }

    watch(
      () => props,
      async () => {
        titles.value = []
        await fetchTitles()
      },
    )
    fetchTitles()

    const loadMore = () => {
      if (additionalPagesAvailable.value) {
        additionalPages.value += 1
        additionalPagesAvailable.value = false
        fetchTitles()
      }
    }

    return {
      fetchTitles,
      titles,
      additionalPagesAvailable,
      loadMore,
    }
  },
}
</script>

<style>
/* Adjustments to file icon */
.citation > a > svg {
  margin: 0 5px 1px 0;
}
.citation a {
  font-weight: normal;
}
</style>
