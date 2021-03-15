// Database access
import prisma from "./prisma.js"
import { DatabaseError } from "./errors.js"

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

export function isMemberParentOf(member1, member2) {
  const member1notation = member1 && member1.notation && member1.notation[1],
    member2notation = member2 && member2.notation && member2.notation[1]
  if (!member1notation || !member2notation) {
    return false
  }
  const regex = /([-.]*[\d.]*)([-.]*)/
  const member1part = member1notation.match(regex)[1],
    member2part = member2notation.match(regex)[1]
  if (!member1part || !member2part) {
    return false
  }
  return member2part.startsWith(member1part)
}

export default { decomposeDDC, findMember, isMemberParentOf }
