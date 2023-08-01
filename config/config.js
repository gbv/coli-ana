// TODO: dotenv not loaded if used outside of Vite

const inBrowser = typeof window !== "undefined"
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD

const config = {
  inBrowser,
  cocoda: process.env.COCODA || "https://coli-conc.gbv.de/cocoda/app/",
  isTest,
}

const verbosityLevels = {
  log: 0,
  info: 1,
  warn: 2,
  error: 3,
}

if (!inBrowser) {
  config.port = process.env.PORT || 11033
  config.verbosity = process.env.VERBOSITY ? verbosityLevels[process.env.VERBOSITY] : 1
  if (config.verbosity === undefined) {
    console.warn(`Config: Unknown verbosity value "${config.verbosity}", using default.`)
    config.verbosity = 1
  }
  // Log methods
  Object.keys(verbosityLevels).forEach(key => {
    config[key] = (...args) => {
      if (isTest || config.verbosity > verbosityLevels[key]) {
        return
      }
      console[key]((new Date()).toISOString(), ...args)
    }
  })
  // Make sure base starts and ends with /
  config.base = process.env.BASE || "/"
  if (!config.base.startsWith("/")) {
    config.base = `/${config.base}`
  }
  if (!config.base.endsWith("/")) {
    config.base = `${config.base}/`
  }
  config.backend = {
    interpreter: process.env.BACKEND_INTERPRETER ? `${process.env.BACKEND_INTERPRETER} ` : "",
    client: process.env.BACKEND_CLIENT || "./bin/vc_day_cli2",
    hosts: (process.env.BACKEND_HOST || "localhost").split(" "),
    ports: (process.env.BACKEND_PORT || "7070").split(" ").map(port => parseInt(port)),
  }
  if (config.backend.ports.findIndex(port => isNaN(port)) !== -1) {
    config.error("Invalid port number given in .env, refusing to start...", process.env.BACKEND_PORT, config.backend.ports)
    process.exit(1)
  }
  if (config.backend.hosts.length !== config.backend.ports.length) {
    config.error("Number of hosts and ports does not match in .env, refusing to start...")
    process.exit(1)
  }
  config.maxRetries = parseInt(process.env.MAX_RETRIES) >= 1 ? parseInt(process.env.MAX_RETRIES) : 3
  config.retryWait = parseInt(process.env.RETRY_WAIT) >= 10 ? parseInt(process.env.RETRY_WAIT) : 1000
  config.timeoutLong = parseInt(process.env.TIMEOUT_LONG) >= 0 ? parseInt(process.env.TIMEOUT_LONG) : 1000
  config.timeoutStale = parseInt(process.env.TIMEOUT_STALE) >= 0 ? parseInt(process.env.TIMEOUT_STALE) : 3000
}

export default config
