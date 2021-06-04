import { expect } from "chai"
import { picaFromDDC, serializePicaField } from "../lib/pica.js"

var memberList = [
  { notation: ["2","2----"] },
  { notation: ["28","28---"] },
  { notation: ["282","282--"] },
  { notation: ["282.4-282.9","282.5"] },
  { notation: ["T2--4-9","---.5"] },
  { notation: ["T2--5","---.5"] },
]

describe("picaFromDDC", () => {
  it("should detect base number", () => {
    const pica = picaFromDDC({ memberList, notation: ["282.5"] })
    expect(serializePicaField(pica[0])).equal("045H/10 $eDDC23ger$a282.5$c282$g5$Acoli-ana")
  })
})
