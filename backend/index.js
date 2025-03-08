// Load dotenv
require("dotenv").config({
    override: true,
    debug: process.env.DEBUG === "true"
  });
  
  // Imports
  const express = require("express");
  require("express-async-errors");
  const useragent = require("express-useragent");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");
  
  const app = express();
  const port = process.env.PORT || 3000;

  async function initialise() {
    // await Promise.all([
    //   sync(),
    // ]);
  }
  
  // Utility Routes
  function setupUtilityRoutes(app) {
    app.get("/ping", (_req, res) => res.send("pong"));
  
    app.get("/ip", async (req, res) => {
      const ip =
        req.ip ||
        (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "")
          .split(",")[0]
          .trim();
      const data = await ipLookUp(ip);
      res.status(200).json(data);
    });
  }
  
  async function main() {
    await initialise();
  
    app.use(useragent.express());
    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: "50mb" }));
  
    setupUtilityRoutes(app);
  
    app.listen(port, () => {
        console.log(`[ INFO ] Server is listening on port ${port}`);
      });
  }
  
  main();