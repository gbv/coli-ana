<template>
  <a
    href=""
    title="go to first page"
    :class="{
      'disabled': page === 1,
    }"
    @click.prevent="page > 1 && goToPage(1)">
    ⏮
  </a>
  <a
    href=""
    title="go to previous page"
    :class="{
      'disabled': !previousPage,
    }"
    @click.prevent="previousPage && goToPage(previousPage)">
    ⏪
  </a>
  Page {{ page }}
  <a
    href=""
    title="go to next page"
    :class="{
      'disabled': !nextPage,
    }"
    @click.prevent="nextPage && goToPage(nextPage)">
    ⏩
  </a>
</template>

<script>
import { computed } from "vue"
import { useRouter, useRoute } from "vue-router"

export default {
  props: {
    page: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      required: true,
    },
    results: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const goToPage = async (page) => {
      await router.push({
        path: "/",
        query: {
          ...route.query,
          page,
        },
      })
    }
    const previousPage = computed(() => {
      if (props.page === 1) {
        return null
      }
      return props.page - 1
    })
    const nextPage = computed(() => {
      const totalCount = props.results.totalCount
      if (totalCount !== undefined && totalCount <= props.page * props.perPage) {
        return null
      }
      return props.page + 1
    })

    return {
      goToPage,
      previousPage,
      nextPage,
    }
  },
}

</script>

<style scoped>
.disabled {
  cursor: default;
  opacity: 0.5;
}
a {
  font-family: "apple color emoji","segoe ui emoji","noto color emoji","android emoji","emojisymbols","emojione mozilla","twemoji mozilla","segoe ui symbol";
  margin-right: -10px;
}
</style>
