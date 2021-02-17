<template>
  <main>
    <h2>Documentation</h2>
    <p>
      Visit <a
        href="https://coli-conc.gbv.de/coli-ana/"
        target="_blank">the project page</a> for background information or
      <a
        href="https://github.com/gbv/coli-ana-api"
        target="_blank">GitHub</a> for technical documentation.
    </p>
    <h2>Examples</h2>
    <table>
      <thead>
        <th />
        <th>
          <a href="https://format.gbv.de/jskos">JSKOS</a>
        </th>
        <th>
          <a href="https://format.gbv.de/pica/json">PICA/JSON</a>
        </th>
        <th>
          <a href="https://format.gbv.de/pica/plain">PICA Plain</a>
        </th>
      </thead>
      <tbody>
        <tr
          v-for="notation in examples"
          :key="notation">
          <td><code>{{ notation }}</code></td>
          <td>
            <a :href="`decompose?notation=${notation}`">jskos</a>
          </td>
          <td>
            <a :href="`decompose?notation=${notation}&format=picajson`">picajson</a>
          </td>
          <td>
            <a :href="`decompose?notation=${notation}&format=pp`">pp</a>
          </td>
          <td v-if="cocoda">
            <a :href="`${cocoda}?fromScheme=${ddc.uri}&from=${ddc.uriFromNotation(notation)}`">
              open in Cocoda
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      PICA format is limited to <a
        href="https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard"
        target="_blank">field 045H/00</a> in <a
          href="https://format.gbv.de/pica/k10plus"
          target="_blank">K10Plus format</a>.
    </p>
  </main>
</template>

<script>
import config from "../config"

export default {
  async setup() {
    return {
      ...config,
    }
  },
}
</script>

<style scoped>

</style>
