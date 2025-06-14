const loadModules = require("../utils/loadModules");
const path = require("path");

/**
 * Dynamically load and register all routes from the routes directory.
 * @param {object} app - Express application instance.
 * @param {object} options - Configuration options.
 * @param {string} options.dir - Base directory path.
 * @param {string} options.routesDir - Routes directory name (default: 'routes').
 */
const loadRoutes = (app, { dir, routesDir = "routes" }) => {
  const routesPath = path.join(dir, routesDir);
  const routes = loadModules(routesDir, dir);

  if (Object.keys(routes).length === 0) {
    console.warn(`[ WARNING ] No routes found in ${routesPath}`);
    return;
  }

  Object.keys(routes).forEach(name => {
    const router = routes[name];
    
    // Check if the exported module is a valid Express router
    if (typeof router === "function") {
      const routePath = `/${name}`;
      app.use(routePath, router);
      console.log(`[ INFO ] Route registered: ${routePath}`);
    } else {
      console.warn(`[ WARNING ] Invalid route module: ${name}. Expected a function (Express router).`);
    }
  });
  
  console.log(`[ INFO ] Loaded ${Object.keys(routes).length} route(s) successfully`);
};

module.exports = loadRoutes;