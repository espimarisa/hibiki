"use strict";

if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
process.env.TS_NODE_PROJECT = require("path").resolve(__dirname, "tsconfig.json");

/* const log = (s) => console.log(`[BOOTSTRAP] ${s}`);
log("Registering aliases from tsconfig.json.");

const fs = require("fs");
const path = require("path");
const aliases = require("module-alias");
const compilerOptions = require("json5").parse(fs.readFileSync(require("path").join(__dirname, "./tsconfig.json"))).compilerOptions;
const paths = compilerOptions.paths;

const n = (s) => s.replace(/\\/g, "/");

const reg = (alias, dir) => {
  alias = n(alias);
  dir = n(dir);
  const res = [];
  fs.readdirSync(dir).forEach((file) => {
    const resFile = n(path.resolve(dir, file));
    if (fs.statSync(resFile).isDirectory()) return res.push(...reg(path.join(alias, file), resFile));
    if (!file.endsWith(".js")) return;
    res.push(resFile);
    aliases.addAlias(n(path.join(alias, file)).slice(0, -3), resFile);
    console.log(n(path.join(alias, file)).slice(0, -3), resFile);
  });
  return res;
};

const res = [];
Object.keys(paths).forEach((v) => {
  console.log(v, "=>", `[ '${paths[v].join("', '")}' ]`);
  paths[v].forEach((d) => {
    if (d.includes("/*")) {
      res.push(...reg(v.replace("/*", ""), path.join(compilerOptions.outDir, compilerOptions.baseUrl, d.replace("/*", ""))));
    } else {
      const p = path.resolve(path.join(compilerOptions.outDir, compilerOptions.baseUrl, d + ".js"));
      aliases.addAlias(v, p);
      console.log(v, p);
      res.push(p);
    }
  });
});

log(`Now starting with ${res.length} aliases registered.`);
require("@Global/Utils").log();*/

require("tsconfig-paths").register();
require("./dist/src/index");
