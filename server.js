import fs from "fs"
import path from "path"
import express from "express"
import config from "./config/index.js"
import compression from "compression"
import serveStatic from "serve-static"
import { decomposeDDC, findMembers, isMemberParentOf } from "./lib/index.js"
import { serializePica, picaFromDDC } from "./lib/pica.js"
const { ddc } = config

// we need require for including Vite's SSR build (see https://github.com/vitejs/vite/discussions/2074)
import { createRequire } from "module"
const require = createRequire(import.meta.url)

// __dirname is not defined in ES6 modules (https://techsparx.com/nodejs/esnext/dirname-es-modules.html)
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
) {
  const resolve = (p) => path.resolve(__dirname, p)

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : ""

  const manifest = isProd
    ? // @ts-ignore
    await import("./dist/client/ssr-manifest.json")
    : {}

  const app = express()
  app.set("json spaces", 2)

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Expose-Headers", "X-Total-Count, Link")
    next()
  })

  /**
   * /analyze API route
   */
  app.get("/analyze", async (req, res, next) => {
    const notations = (req.query.notation || "").split("|").filter(n => n !== "")
    const format = req.query.format || "jskos"
    req.query.member = req.query.member || ""
    req.query.limit = req.query.limit || 10
    req.query.offset = req.query.offset || 0

    let result = []

    try {
      // Analyze notations
      if (req.query.notation) {
        for (let notation of notations) {
          const concept = ddc.conceptFromNotation(notation, { inScheme: true })
          if (!concept) {
            continue
          }

          concept.memberList = await decomposeDDC(ddc, notation)
          result.push(concept)
        }
      }
      // Analyze member
      else {
        result = await findMembers(req.query)
      }
      res.set("X-Total-Count", result.totalCount || result.length)
      // Adjust result
      result = result.map(concept => {
        const memberList = concept.memberList
        if (memberList) {
          // Check if it's necessary to swap some lines
          // TODO: Verify and test this check.
          for (let i = 1; i < memberList.length; i += 1) {
            if (memberList[i].notation[1] === memberList[i - 1].notation[1] && memberList[i].notation[0].length > memberList[i - 1].notation[0].length) {
              [memberList[i], memberList[i - 1]] = [memberList[i - 1], memberList[i]]
            }
          }
          for (let i = 1; i < memberList.length; i += 1) {
            // Add broader fields to members
            const member1 = memberList[i - 1]
            const member2 = memberList[i]
            if (isMemberParentOf(member1, member2)) {
              member2.broader = [{ uri: member1.uri }]
            }
          }
          concept.memberList = memberList
        }
        return concept
      })
    } catch (error) {
      next(error)
      return
    }

    if (format === "picajson") {
      result = [].concat.apply([],result.map(picaFromDDC)) // merge into one record
    } else if (format === "pp") {
      result = result.map(concept => serializePica(picaFromDDC(concept))).join("\n")
    }

    return res.send(result)
  })

  // Redirect old URLs (#16)
  app.get(new RegExp(`^/(${ddc.notationPattern})$`), (req, res) => {
    res.redirect(`${config.base}?notation=${req.params[0]}`)
  })

  /**
   * Vite SSR
   */
  let vite
  if (!isProd) {
    vite = await (await import("vite")).createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
      },
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(compression())
    app.use(
      serveStatic(resolve("dist/client"), {
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
        render = require("./dist/server/entry-server.cjs").render
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

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.code || 500).send(err.message || "Something went wrong.")
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
