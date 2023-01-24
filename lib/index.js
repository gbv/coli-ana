import config from "../config/config.js"
import childProcess from "child_process"
import { getConceptFromBackend } from "./backend.js"

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout ? stdout : stderr)
      }
    })
  })
}

export async function decomposeDDC(ddc, notation, { warn } = {}) {
  const maxRetries = 3, waitBetweenRetries = 1000
  let result, backend, errorMessage
  // Try backend service first
  if (config.backend) {
    // Temporary error handling/output for https://github.com/gbv/coli-ana/issues/76
    let retries = maxRetries
    while (!result && retries > 0) {
      if (retries !== maxRetries) {
        // Wait for a second until next retry
        await new Promise(resolve => setTimeout(resolve, waitBetweenRetries))
      }
      retries -= 1
      try {
        const shellOutput = await execShellCommand(`timeout 2 ${config.backend.interpreter} ${config.backend.client} -v srv_name=${config.backend.host} -v vc_day_port=${config.backend.port} -v dno=${notation}`)
        for await (const concept of getConceptFromBackend(shellOutput, { warn })) {
          if (concept) {
            result = concept
            backend = "vc_day_srv"
          } else {
            errorMessage = "getConceptFromBackend failed to return concept"
          }
          break
        }
      } catch (error) {
        // TODO: Do nothing on error?
        errorMessage = error.message
      }
    }

    if (!result) {
      warn(`Error analyzing notation ${notation}: ${errorMessage}`)
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
