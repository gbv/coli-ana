export function cleanupNotation(notation) {
  return typeof notation === "string" ? notation.replace(/[/' ]/g,"") : ""
}

export function baseNumberIndex(members) {
  var i=0
  while(i<members.length && members[i].notation[1][0] !== "-") { i++ }
  return i>0?i-1:0
}

export function baseNumberFromIndex(members, i) {
  var baseNumber = members[i].notation[0]
  if (i+1<members.length) {
    var { length } = members[i+1].notation[1].replace(/[^-.].*/,"")
    baseNumber = baseNumber.substr(0,length === 4 ? 3 : length)
  }
  return baseNumber
}
