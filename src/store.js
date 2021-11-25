import { reactive } from "vue"
import { cdk, SkosmosApiProvider } from "cocoda-sdk"
cdk.addProvider(SkosmosApiProvider)

export const languages = [
  {
    id: "de",
    label: "Deutsch",
  },
  {
    id: "nb",
    label: "Norsk",
  },
]
export const registries = {
  de: cdk.initializeRegistry({
    provider: "ConceptApi",
    status: "https://coli-conc.gbv.de/api/status",
    schemes: [
      {
        uri: "http://dewey.info/scheme/edition/e23/",
      },
    ],
  }),
  nb: cdk.initializeRegistry({
    provider: "SkosmosApi",
    uri: "http://coli-conc.gbv.de/registry/skosmos-ddc-norsk",
    api: "https://data.ub.uio.no/skosmos/rest/v1/",
    schemes: [
      {
        uri: "http://dewey.info/scheme/edition/e23/",
        VOCID: "ddc",
      },
    ],
  }),
}

// This is not an actual concept but part of analysis
const facetIndicator = {
  uri: "http://dewey.info/facet/0",
  notation: ["0"],
  prefLabel: {
    de: "Facettenindikator",
    en: "facet indicator",
    nb: "fasettindikator",
  },
  _loaded: {
    de: true,
    nb: true,
  },
}

export const store = {
  state: reactive({ "http://dewey.info/facet/0": facetIndicator }),
  languages: reactive(languages.map(lang => lang.id)),
  getConcept(concept) {
    return this.state[concept.uri]
  },
  async loadConcepts(concepts) {
    const lang = this.languages[0]
    const registry = registries[lang]
    let toLoad = concepts.filter(c => !this.state[c.uri] || !this.state[c.uri]._loaded || !this.state[c.uri]._loaded[lang])
    toLoad = toLoad.map(concept => ({ ...concept, inScheme: registry.schemes }))
    if (toLoad.length) {
      // TODO: Right now, `getConcepts` fails if just one concept returns an error, so we're calling it separately for each concept. This should be improved.
      // const loadedConcepts = await registry.getConcepts({ concepts: toLoad })
      const loadedConcepts = (await Promise.all(
        toLoad.map(
          concept => registry.getConcepts({ concepts: [concept] })
            .catch(() => [])
            .then(concepts => concepts[0]),
        ),
      )).filter(Boolean)
      for (let concept of loadedConcepts) {
        if (!concept._loaded) {
          concept._loaded = {}
        }
        concept._loaded[lang] = true
        if (!this.state[concept.uri]) {
          this.state[concept.uri] = concept
        } else {
          this.integrate(this.state[concept.uri], concept)
        }
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
      } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
        // TODO: Integrate arrays
      } else if (target[key] instanceof Object && source[key] instanceof Object) {
        // TODO: Could cause an infinite loop?
        this.integrate(target[key], source[key])
      }
    }
  },
}
