import isMemberParentOf from "./isMemberParentOf.js"

export function cleanupNotation(notation) {
  return typeof notation === "string" ? notation.replace(/[/' ]/g,"") : ""
}

const isElemental = (members, i) =>
  i == members.length-1 || isMemberParentOf(members[i - 1], members[i]) && !isMemberParentOf(members[i], members[i + 1])

export const atomicMembers = members => {
  members = members.filter(Boolean)
  if (!members.length) return {}

  const atomic = {}

  var first = 0
  while(first<members.length && members[first].notation[1][0] !== "-") {
    first++
  }
  first = first > 0 ? first-1 : 0

  for (let i = first; i<members.length; i++) {
    const notation = members[i].notation[0]

    if (notation === "http://dewey.info/facet/0") {
      continue
    }

    if (isElemental(members, i)) {
      atomic[members[i].uri] = true
    }
  }

  // adjust base number
  var baseNumber = members[first].notation[0]
  if (first+1<members.length) {
    var { length } = members[first+1].notation[1].replace(/[^-.].*/,"")
    baseNumber = baseNumber.substr(0,length === 4 ? 3 : length)
  }
  atomic[`http://dewey.info/class/${baseNumber}/e23/`] = true
  const otherBaseMember = members[first]
  if (otherBaseMember.notation[0] !== baseNumber) {
    atomic[otherBaseMember.uri] = false
    otherBaseMember.BASE = true // side effect!!
  }

  return atomic
}
