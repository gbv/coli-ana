// Database access
import prisma from "./prisma.js"
import { DatabaseError } from "./errors.js"
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

export async function decomposeDDC(ddc, notation, { forceDatabase = false, warn } = {}) {
  let result, backend
  // Try backend service first
  if (config.backend && !forceDatabase) {
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
      // Do nothing on error - we might be able to fall back to the database
    }
  }
  // If needed, fall back to the database
  if (!result || !result.memberList) {
    try {
      result = await prisma.data.findUnique({
        where: {
          uri: ddc.uriFromNotation(notation),
        },
      })
      if (result) {
        backend = "database"
      }
    } catch (error) {
      // Only throw error if no backend is configured
      if (!config.backend || forceDatabase) {
        throw new DatabaseError()
      }
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
