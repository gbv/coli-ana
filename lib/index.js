// Database access
import prisma from "./prisma.js"
import { DatabaseError } from "./errors.js"
import isMemberParentOf from "./isMemberParentOf.js"
import config from "../config/config.js"
import childProcess from "child_process"
import { parseInputStream } from "./parseInputStream.js"

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

export async function decomposeDDC(ddc, notation) {
  let result
  try {
    result = await prisma.data.findUnique({
      where: {
        uri: ddc.uriFromNotation(notation),
      },
    })
  } catch (error) {
    throw new DatabaseError()
  }
  if ((!result || !result.memberList) && config.backend) {
    try {
      const shellOutput = await execShellCommand(`echo "${notation}" | nc -N ${config.backend.host} ${config.backend.port}`)
      for await (const concept of parseInputStream(shellOutput)) {
        if (concept) {
          result = concept
        }
        break
      }
    } catch (error) {
      // Do nothing on error - it was worth a try
    }
  }
  return ((result && result.memberList) || []).map(concept => {
    if (concept.uri) {
      // Do not convert if URI already exists
      return concept
    }
    // Otherwise, add URI and inScheme
    concept.uri = ddc.uriFromNotation(concept.notation[0])
    concept.inScheme = result.inScheme
    return concept
  })
}

export async function findMembers({ member: search, limit, offset }) {
  let result
  try {
    let sql = "select * from data"
    if (search) {
      sql += " where "
      sql += search.split("|").map(member => {
        let json
        // Differentiate between URI and notation
        // TODO: Use more sophisticated URI detection.
        if (member.startsWith("http:") || member.startsWith("https:")) {
          json = [{ uri: member }]
        } else {
          json = [{ notation: [member] }]
        }
        return `"memberList" @> '${JSON.stringify(json)}'`
      }).join(" or ")
    }
    result = await prisma.$queryRaw(sql + ` order by uri limit ${limit + 1} offset ${offset}`)
    if (result.length < limit + 1) {
      // If the database returns less than the limit, we know that there are no further results.
      result.totalCount = offset + result.length
    } else {
      // Otherwise there are more results and we need to slice off the last element.
      result = result.slice(0, result.length - 1)
    }
  } catch (error) {
    throw new DatabaseError()
  }
  return result
}

export { isMemberParentOf }

export default { decomposeDDC, findMembers, isMemberParentOf }
