// Database access
import prisma from "./prisma.js"
import { DatabaseError } from "./errors.js"
import isMemberParentOf from "./isMemberParentOf.js"

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

export async function findMember(member) {
  let result
  try {
    let json
    // Differentiate between URI and notation
    // TODO: Use more sophisticated URI detection.
    if (member.startsWith("http:") || member.startsWith("https:")) {
      json = [{ uri: member }]
    } else {
      json = [{ notation: [member] }]
    }
    result = await prisma.$queryRaw(`select * from data where "memberList" @> '${JSON.stringify(json)}';`)
  } catch (error) {
    throw new DatabaseError()
  }
  return result
}

export { isMemberParentOf }

export default { decomposeDDC, findMember, isMemberParentOf }
