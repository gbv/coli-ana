// configuration
const version = require("./package.json")
const port = 25431
const config = { port, version }
config.examples = ["333.771509431"]

const express = require("express")
const app = express()
app.set("json spaces", 2)

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

function decomposeDDC(notation) {
    if (notation === "333.771509431") {
        return [
            { "uri": "http://dewey.info/class/700/e23/", "notation": "700" },
            { "uri": "http://dewey.info/class/1--09044/e23/", "notation": "T1--09044" }            
        ]
    }
    return
}

function memberListPica(memberList) {
    const pica = ["045H", "00"]

    // TODO, see https://swbtools.bsz-bw.de/cgi-bin/k10plushelp.pl?cmd=kat&val=5400&katalog=Standard
    
    return [ pica ]
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.render("base", {
    config,
  })
})


app.get("/:notation", (req, res) => {
  const { notation } = req.params
  const format = req.query.format || 'jskos'

  const memberList = decomposeDDC(notation)
  if (memberList) {
    const jskos = {
      notation: [ notation ],
      memberList
    }
    if (format === "picajson") {
        return res.send(memberListPica(memberList))
    } else {
        return res.send(jskos)
    }
  } else {
    return res.send([])
  }
})

app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
})
