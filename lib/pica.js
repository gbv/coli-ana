import isMemberParentOf from "./isMemberParentOf.js"

/**
 * Build a PICA record with analyzed DDC number fields.
 *
 * See https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard.
 */
export function picaFromDDC(concept) {
  const members = concept.memberList || []

  // Assumes we always have DDC23 German edition!
  const pica = ["045H", "00", "e", "[DDC23ger]", "a", concept.notation[0]]

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

  for (let i=0; i<members.length; i++) {
    const notation = members[i].notation[0]

    if (notation === "http://dewey.info/facet/0") {
      continue
    }

    if (i>0 && isMemberParentOf(members[i-1], members[i]) && !isMemberParentOf(members[i], members[i+1])) {
      const [ table, number ] = notation.split("--")
      const id = subfields[table]
      if (id) {
        pica.push(id, number)
      } else {
        pica.push("c", notation)
      }
    }
  }

  // TODO: make sure non-repeatable fields are not repeated
  // TODO: how about $t ("Notation aus Anhängetafeln (extern)")
  // TODO: add source in $A ?

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
