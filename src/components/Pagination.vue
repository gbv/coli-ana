<template>
  <a
    v-if="page > 2"
    href=""
    title="go to first page"
    @click.prevent="goToPage(1)">
    ⏮
  </a>
  <a
    v-if="previousPage"
    href=""
    title="go to previous page"
    @click.prevent="goToPage(previousPage)">
    ⏪
  </a>
  Page {{ page }} of {{ lastPage }}
  <a
    v-if="nextPage"
    href=""
    title="go to next page"
    @click.prevent="goToPage(nextPage)">
    ⏩
  </a>
  <a
    v-if="page < lastPage - 1"
    href=""
    title="go to last page"
    @click.prevent="goToPage(lastPage)">
    ⏭
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
    const totalCount = computed(() => {
      return (props.results && props.results.totalCount) || 0
    })
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
      if (totalCount.value <= props.page * props.perPage) {
        return null
      }
      return props.page + 1
    })
    const lastPage = computed(() => Math.ceil(totalCount.value / props.perPage))

    return {
      goToPage,
      previousPage,
      nextPage,
      lastPage,
    }
  },
}

</script>
