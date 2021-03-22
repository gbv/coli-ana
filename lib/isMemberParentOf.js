export default function isMemberParentOf(member1, member2) {
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
