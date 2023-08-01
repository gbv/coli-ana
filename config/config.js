// TODO: dotenv not loaded if used outside of Vite

const inBrowser = typeof window !== "undefined"
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD

const warn = (...args) => {
  !isTest && console.warn((new Date()).toISOString(), ...args)
}

const config = {
  inBrowser,
  cocoda: process.env.COCODA || "https://coli-conc.gbv.de/cocoda/app/",
  warn,
  isTest,
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
  config.backend = {
    interpreter: process.env.BACKEND_INTERPRETER ? `${process.env.BACKEND_INTERPRETER} ` : "",
    client: process.env.BACKEND_CLIENT || "./bin/vc_day_cli2",
    hosts: (process.env.BACKEND_HOST || "localhost").split(" "),
    ports: (process.env.BACKEND_PORT || "7070").split(" ").map(port => parseInt(port)),
  }
  if (config.backend.ports.findIndex(port => isNaN(port)) !== -1) {
    console.error("Invalid port number given in .env, refusing to start...", process.env.BACKEND_PORT, config.backend.ports)
    process.exit(1)
  }
  if (config.backend.hosts.length !== config.backend.ports.length) {
    console.error("Number of hosts and ports does not match in .env, refusing to start...")
    process.exit(1)
  }
  config.maxRetries = parseInt(process.env.MAX_RETRIES) >= 1 ? parseInt(process.env.MAX_RETRIES) : 3
  config.retryWait = parseInt(process.env.RETRY_WAIT) >= 10 ? parseInt(process.env.RETRY_WAIT) : 1000
  config.timeoutLong = parseInt(process.env.TIMEOUT_LONG) >= 0 ? parseInt(process.env.TIMEOUT_LONG) : 1000
  config.timeoutStale = parseInt(process.env.TIMEOUT_STALE) >= 0 ? parseInt(process.env.TIMEOUT_STALE) : 3000
}

export default config
