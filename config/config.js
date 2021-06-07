// TODO: dotenv not loaded if used outside of Vite

const inBrowser = typeof window !== "undefined"

const config = {
  inBrowser,
  cocoda: process.env.COCODA || "https://coli-conc.gbv.de/cocoda/app/",
}

if (!inBrowser) {
  config.port = process.env.PORT || 11033
  config.base = process.env.BASE || "/"
  // Make sure base starts and ends with /
  if (!config.base.startsWith("/")) {
    config.base = `/${config.base}`
  }
  if (!config.base.endsWith("/")) {
    config.base = `${config.base}/`
  }
  if (process.env.BACKEND_HOST) {
    config.backend = {
      host: process.env.BACKEND_HOST,
      port: process.env.BACKEND_PORT,
    }
  }
}

export default config
