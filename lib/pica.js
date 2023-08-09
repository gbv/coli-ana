import { atomicMembers } from "./baseNumber.js"

/**
 * Build a PICA record with analyzed DDC number fields.
 *
 * See https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard.
 */
export function picaFromDDC(concept) {
  const members = concept.memberList || []

  // skip incomplete or unknown decomposition
  if (members.includes(null) || members.length === 0) {
    return []
  }

  // Assumes we always have 23rd edition!
  const pica = ["045H", "20", "e", "23", "a", concept.notation[0]]

  const subfields = {
    T1: "f",
    T2: "g",
    T3A: "h",
    T3B: "i",
    T3C: "j",
    T4: "k",
    T5: "l",
    T6: "m",
  }

  const atomic = atomicMembers(members)
  pica.push("c", atomic[0].notation[0])

  for (let i=1; i<atomic.length; i++) {
    const notation = atomic[i].notation[0]
    const [ table, number ] = notation.split("--")
    const code = subfields[table]
    if (code) { // notation from table
      pica.push(code, number.replace(/^.+:/,"")) // map internal number within range to specific notation
    } else {  // notation from main schedule
      pica.push("d", notation)
    }
  }

  // TODO: make sure non-repeatable fields are not repeated?

  pica.push("A", "coli-ana")

  return [pica]
}

// from https://www.npmjs.com/package/pica-data
export const picaFieldIdentifier = field => {
  const [tag, occ] = field
  return tag + (occ ? "/" + (occ.length === 1 ? "0" + occ : occ) : "")
}
export const serializePicaField = field =>
  picaFieldIdentifier(field)
    + " "
    + field.slice(2).map((s,i) => i % 2 ? s.replace(/\$/g,"$$$") : "$" + s).join("")
export const serializePica = pica => pica.map(serializePicaField).join("\n")

export function pica3FromDDC(concept) {
  const pica = picaFromDDC(concept).find(field => field[0] === "045H") || []
  const subfields = {
    A: "$A",
    L: "$L",
    a: "",
    c: "-G--",
    d: "-H--",
    f: "-T1--",
    g: "-T2--",
    h: "-T3A--",
    i: "-T3B--",
    j: "-T3C--",
    k: "-T4--",
    l: "-T5--",
    m: "-T6--",
    t: "-I--",
  }

  var pica3 = pica.length ? `54${pica[1]} [${pica[3]}]` : ""

  const sfs = pica.slice(4)
  while (sfs.length) {
    const code = sfs.shift()
    const value = sfs.shift()
    if (code in subfields) {
      pica3 += subfields[code] + value
    }
  }

  return pica3
}
