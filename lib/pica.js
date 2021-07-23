import isMemberParentOf from "./isMemberParentOf.js"

/**
 * Build a PICA record with analyzed DDC number fields.
 *
 * See https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard.
 */
export function picaFromDDC(concept) {
  const members = (concept.memberList || []).filter(m => m != null)

  // Assumes we always have DDC23 German edition!
  const pica = ["045H", "10", "e", "DDC23ger", "a", concept.notation[0]]

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

  var baseNumber
  for (var i=0; i<members.length && members[i].notation[1][0] !== "-"; i++) {
    baseNumber = members[i].notation[0]
  }

  if (i<members.length) {
    var { length } = members[i].notation[1].replace(/[^-.].*/,"")
    baseNumber = baseNumber.substr(0,length === 4 ? 3 : length)
  }

  pica.push("c", baseNumber)

  for (; i<members.length; i++) {
    const notation = members[i].notation[0]

    if (notation === "http://dewey.info/facet/0") {
      continue
    }

    if (i>0 && isMemberParentOf(members[i-1], members[i]) && !isMemberParentOf(members[i], members[i+1])) {
      const [ table, number ] = notation.split("--")
      const id = subfields[table]
      if (id) { // notation from table
        pica.push(id, number.replace(/^.+:/,"")) // map internal number within range to specific notation
      } else {  // notation from main schedule
        pica.push("d", notation)
      }
    }
  }

  // TODO: don"t convert incomplete analysis?
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
