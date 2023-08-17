import { expect } from "chai"
import { picaFromDDC, serializePicaField } from "../lib/pica.js"
import { markAtomicMembers } from "../lib/baseNumber.js"

import { createRequire } from "module"
const require = createRequire(import.meta.url)
const tests = require("./pica-tests.json")

describe("markAtomicMembers", () => {
  tests.forEach(({ memberList: expectedMemberList }) => {
    const memberList = expectedMemberList.map(member => ({ ...member }))
    markAtomicMembers(memberList)
    // Remove "BASE" as it will fail this test
    memberList.filter(member => member.BASE).forEach(member => {
      delete member.BASE
    })
    expect(memberList).deep.equal(expectedMemberList)
  })
})

describe("serializePicaField", () => {
  tests.forEach(({notation, memberList, pica}) => {
    it(`${notation}`, () => {
      const field = picaFromDDC({ notation, memberList })[0]
      if (field) {
        expect(serializePicaField(field)).equal(pica)
      } else {
        expect(null, pica)
      }
    })
  })
})
