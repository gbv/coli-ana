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

// See https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard
export function build045H(ddc, concept) {
  const { notation, memberList } = concept
  const pica = ["045H", "00", "a", notation[0]]

  if (!memberList) {
    return pica
  }

  const parts = memberList.map(m => ddc.notationFromUri(m.uri)).filter(n => !!n)

  if (notation[0].startsWith(parts[0])) {
    pica.push("c", parts.shift()) // Grundnotation
  }

  const subfields = {
    1: "f",
    2: "g",
    "3A": "h",
    "3B": "i",
    "3C": "j",
    4: "k",
    5: "l",
    6: "m",
  }

  parts.forEach(part => {
    const [ table, number ] = part.split("--")
    const id = subfields[table]
    if (id) {
      pica.push(id, number)
    } else {
      // TODO: log some warning for later inspection
    }
  })

  // TODO: how about $t ("Notation aus Anhängetafeln (extern)")
  // TODO: add source in $A ?

  return pica
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

export default { decomposeDDC, build045H, findMember, isMemberParentOf }
