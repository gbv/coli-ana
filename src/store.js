import { reactive } from "vue"
import cdk from "cocoda-sdk"

export const registry = cdk.initializeRegistry({
  provider: "ConceptApi",
  status: "https://coli-conc.gbv.de/api/status",
  schemes: [
    {
      uri: "http://dewey.info/scheme/edition/e23/",
    },
  ],
})

export const store = {
  state: reactive({}),
  getConcept(concept) {
    return this.state[concept.uri]
  },
  async loadConcepts(concepts) {
    const toLoad = concepts.filter(c => !this.state[c.uri])
    if (toLoad.length) {
      const loadedConcepts = await registry.getConcepts({ concepts: toLoad })
      for (let concept of loadedConcepts) {
        concept._loaded = true
        this.state[concept.uri] = concept
      }
    }
    return concepts.map(c => this.getConcept(c) || c)
  },
  async loadConcept(concept) {
    return (await this.loadConcepts([concept]))[0]
  },
  integrate(target, source) {
    for (let key of Object.keys(source)) {
      if (!target[key]) {
        target[key] = source[key]
      }
    }
  },
}
