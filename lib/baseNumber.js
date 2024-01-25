import isMemberParentOf from "./isMemberParentOf.js"

export function cleanupNotation(notation) {
  return typeof notation === "string" ? notation.replace(/[/' ]/g,"") : ""
}

const isElemental = (members, i) =>
  i == members.length-1 || isMemberParentOf(members[i - 1], members[i]) && !isMemberParentOf(members[i], members[i + 1])

export const markAtomicMembers = members => {
  const membersNonNull = members.filter(Boolean)
  if (!membersNonNull.length) {
    return members
  }

  let first = 0
  while (first < membersNonNull.length && membersNonNull[first].notation[1][0] !== "-") {
    first++
  }
  first = first > 0 ? first - 1 : 0

  for (let i = first; i < membersNonNull.length; i++) {
    if (membersNonNull[i].uri === "http://dewey.info/facet/0") {
      continue
    }
    if (isElemental(membersNonNull, i)) {
      membersNonNull[i].ATOMIC = true
    }
  }

  // adjust base number
  let baseNumber = membersNonNull[first].notation[0]
  if (first + 1 < membersNonNull.length) {
    let { length } = membersNonNull[first + 1].notation[1].replace(/[^-.].*/, "")
    baseNumber = baseNumber.substr(0, length === 4 ? 3 : length)
  }
  const baseMember = membersNonNull.find(member => member.notation[0] === baseNumber)
  if (baseMember) {
    baseMember.ATOMIC = true
  }
  const otherBaseMember = membersNonNull[first]
  if (otherBaseMember.notation[0] !== baseNumber) {
    delete otherBaseMember.ATOMIC
    otherBaseMember.BASE = true
  }

  return members
}
