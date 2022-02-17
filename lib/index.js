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
  let result, backend
  // Try backend service first
  if (config.backend) {
    try {
      const shellOutput = await execShellCommand(`echo "${notation}" | ${config.backend.command} ${config.backend.host} ${config.backend.port}`)
      for await (const concept of getConceptFromBackend(shellOutput, { warn })) {
        if (concept) {
          result = concept
          backend = "vc_day_srv"
        }
        break
      }
    } catch (error) {
      // TODO: Do nothing on error?
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
