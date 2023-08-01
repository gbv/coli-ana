import config from "../config/config.js"
import childProcess from "child_process"
import { getConceptFromBackend } from "./backend.js"
import terminate from "terminate"

const queue = []

// https://stackoverflow.com/a/34637436/11050851
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

let backendIndex = 0

/**
 * Queues a shell command and returns it as a Promise.
 *
 * @param cmd {string}
 * @return {Promise<string>}
 */
async function analyzeNotation(notation) {
  // We are using a queue here because the vc_day_srv backend struggles with multiple parallel requests
  const deferred = new Deferred()
  queue.push(deferred)
  queue.length > 1 && await queue.shift()?.promise
  return new Promise((resolve, reject) => {
    const cmd = `${config.backend.interpreter} ${config.backend.client} -v srv_name=${config.backend.hosts[backendIndex]} -v vc_day_port=${config.backend.ports[backendIndex]} -v dno=${notation}`
    let timeoutLong, timeoutStale
    const { pid } = childProcess.exec(cmd, (error, stdout, stderr) => {
      clearTimeout(timeoutStale)
      clearTimeout(timeoutLong)
      deferred.resolve()
      if (error) {
        reject(error)
      } else {
        resolve(stdout ? stdout : stderr)
      }
    })
    // Warn for long commands
    if (config.timeoutLong) {
      timeoutLong = setTimeout(() => {
        config.warn(`Command "${cmd}" taking more than ${config.timeoutLong / 1000} seconds.`)
      }, config.timeoutLong)
    }
    // Kill stale commands
    if (config.timeoutStale) {
      timeoutStale = setTimeout(() => {
        // Also rotate backend index if possible
        backendIndex = (backendIndex + 1) % config.backend.hosts.length
        config.warn(`Command "${cmd}" took more than ${config.timeoutStale / 1000} seconds, killing it.`, config.backend.hosts.length > 1 ? ` Also rotating backend host to ${config.backend.hosts[backendIndex]}:${config.backend.ports[backendIndex]}.` : "")
        terminate(pid)
      }, config.timeoutStale)
    }
  })
}

export async function decomposeDDC(ddc, notation) {
  let result, backend, errorMessage, backendIndexBefore = backendIndex
  // Try backend service first
  if (config.backend) {
    // Temporary error handling/output for https://github.com/gbv/coli-ana/issues/76
    let retries = config.maxRetries
    while (!result && retries > 0) {
      if (retries !== config.maxRetries) {
        // Wait for a second until next retry
        await new Promise(resolve => setTimeout(resolve, config.retryWait))
      }
      retries -= 1
      try {
        const shellOutput = await analyzeNotation(notation)
        for await (const concept of getConceptFromBackend(shellOutput)) {
          if (concept) {
            result = concept
            backend = "vc_day_srv"
          } else {
            errorMessage = "getConceptFromBackend failed to return concept"
          }
          break
        }
      } catch (error) {
        if (error.message.includes("Connection refused") && config.backend.hosts.length > 1) {
          if (backendIndexBefore === backendIndex) {
            backendIndex = (backendIndex + 1) % config.backend.hosts.length
            config.warn(`Connection error when analyzing ${notation}, rotating host to ${config.backend.hosts[backendIndex]}:${config.backend.ports[backendIndex]}.`)
          } else {
            config.warn(`Connection error when analyzing ${notation}, trying again with already rotated host.`)
          }
          continue
        }
        // TODO: Do nothing on error?
        errorMessage = error.message
      }
    }

    if (!result) {
      config.warn(`Error analyzing notation ${notation}: ${errorMessage}`)
    }
  }
  const memberList = ((result && result.memberList) || []).map(concept => {
    if (concept.uri) {
      // Do not convert if URI already exists
      return concept
    }
    // Otherwise, add URI and inScheme
    concept.uri = ddc.uriFromNotation(concept.notation[0])
    concept.inScheme = result.inScheme
    return concept
  })
  memberList._backend = backend
  return memberList
}

export default { decomposeDDC }
