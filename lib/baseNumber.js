import isMemberParentOf from "./isMemberParentOf.js"

export function cleanupNotation(notation) {
  return typeof notation === "string" ? notation.replace(/[/' ]/g,"") : ""
}

function baseNumberIndex(members) {
  members = members.filter(Boolean)
  if (members.length === 0) return -1
  var i=0
  while(i<members.length && members[i].notation[1][0] !== "-") { i++ }
  return i>0?i-1:0
}

function baseNumberFromIndex(members, i) {
  members = members.filter(Boolean)
  if (members.length === 0 || i === -1) return null
  var baseNumber = members[i].notation[0]
  if (i+1<members.length) {
    var { length } = members[i+1].notation[1].replace(/[^-.].*/,"")
    baseNumber = baseNumber.substr(0,length === 4 ? 3 : length)
  }
  return baseNumber
}

function isElemental(members, i) {
  members = members.filter(Boolean)
  return i == members.length-1 || isMemberParentOf(members[i - 1], members[i]) && !isMemberParentOf(members[i], members[i + 1])
}

// TODO: use atomicMemberSet and adjust baseNumber or move this code to pica.js
export const atomicMembers = members => {
  members = members.filter(Boolean)
  const atomic = []

  var i = baseNumberIndex(members)
  const baseNumber = {...members[i], notation: [ baseNumberFromIndex(members, i) ]}
  atomic.push(baseNumber)

  for (i++; i<members.length; i++) {
    const notation = members[i].notation[0]

    if (notation === "http://dewey.info/facet/0") {
      continue
    }

    if (isElemental(members, i)) {
      atomic.push(members[i])
    }
  }

  return atomic
}

export const atomicMemberSet = members => {
  members = members.filter(Boolean)

  const atomic = {}
  for (let i = baseNumberIndex(members); i<members.length; i++) {
    const notation = members[i].notation[0]

    if (notation === "http://dewey.info/facet/0") {
      continue
    }

    if (isElemental(members, i)) {
      atomic[members[i].uri] = true
    }
  }

  return atomic
}
