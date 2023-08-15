import { expect } from "chai"
import { picaFromDDC, serializePicaField } from "../lib/pica.js"
import { atomicMembers } from "../lib/baseNumber.js"

import { createRequire } from "module"
const require = createRequire(import.meta.url)
const tests = require("./pica-tests.json")

describe("atomicMembers", () => {
  tests.forEach(({memberList}) => {
    const atomic = atomicMembers(memberList)
    const elements = new Set(memberList.filter(({ATOMIC}) => ATOMIC).map(({uri}) => uri))
    expect(elements).deep.equal(new Set(Object.keys(atomic).filter(uri => atomic[uri])))
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
