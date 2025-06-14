const fs = require("fs");
const path = require("path");

const loadModules = (dirPath, baseDir = __dirname) => {
  const dir = path.resolve(baseDir, dirPath);
  const modules = {};
  
  if (!fs.existsSync(dir)) {
    console.warn(`[ WARNING ] Directory ${dir} does not exist`);
    return modules;
  }

  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith(".js") && file !== "index.js" && file !== "sync.js") {
      const moduleName = path.basename(file, ".js");
      const modulePath = path.join(dir, file);
      
      try {
        console.log(`[ INFO ] Loading module: ${moduleName} from ${modulePath}`);
        modules[moduleName] = require(modulePath);
      } catch (error) {
        console.error(`[ ERROR ] Failed to load module ${moduleName}:`, error.message);
      }
    }
  });
  
  return modules;
};

module.exports = loadModules;