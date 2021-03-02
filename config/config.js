// TODO: dotenv not loaded if used outside of Vite

const inBrowser = typeof window !== "undefined"

const config = {
  inBrowser,
  cocoda: process.env.COCODA || "https://coli-conc.gbv.de/cocoda/app/",
}

/* rollup-remove-start */
if (!inBrowser) {
  config.port = process.env.PORT || 11033
  config.base = process.env.BASE || "/"
}
/* rollup-remove-end */

export default config
