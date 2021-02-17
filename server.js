const fs = require("fs")
const path = require("path")
const express = require("express")
const config = require("./config.js")
const { ddc } = config

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
) {
  const resolve = (p) => path.resolve(__dirname, p)

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : ""

  const manifest = isProd
    ? // @ts-ignore
    require("./dist/client/ssr-manifest.json")
    : {}

  const app = express()
  app.set("json spaces", 2)

  /**
   * /decompose API route
   */
  const { decomposeDDC, build045H } = require("./lib")
  app.get("/decompose", async (req, res) => {
    const notations = req.query.notation.split("|")
    const format = req.query.format || "jskos"

    const result = []

    for (let notation of notations) {
      const concept = ddc.conceptFromNotation(notation, { inScheme: true })
      if (!concept) {
        continue
      }

      const memberList = await decomposeDDC(ddc, notation)
      if (memberList) {
        concept.memberList = memberList
      }

      if (format === "picajson") {
        const field = build045H(ddc, concept)
        result.push(field)
      } else if (format === "pp") {
        const field = build045H(ddc, concept)
        let pp = field.shift() + "/" + field.shift() + " "
        while (field.length) {
          pp += "$" + field.shift() + field.shift()
        }
        return res.send(pp)
      } else {
        result.push(concept)
      }
    }

    return res.send(result)
  })

  /**
   * Vite SSR
   */
  let vite
  if (!isProd) {
    vite = await require("vite").createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
      },
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(require("compression")())
    app.use(
      require("serve-static")(resolve("dist/client"), {
        index: false,
      }),
    )
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve("index.html"), "utf-8")
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule("./src/entry-server.js")).render
      } else {
        template = indexProd
        render = require("./dist/server/entry-server.js").render
      }

      const [appHtml, preloadLinks] = await render(url, manifest)

      const html = template
        .replace("<!--preload-links-->", preloadLinks)
        .replace("<!--app-html-->", appHtml)

      res.status(200).set({ "Content-Type": "text/html" }).end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(config.port, () => {
      console.log(`Now listening on port ${config.port}`)
    }),
  )
}
