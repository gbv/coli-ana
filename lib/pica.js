// See https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard
export default function build045H(ddc, concept) {
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


