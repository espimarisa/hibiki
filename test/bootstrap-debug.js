"use strict";

if (!process.env.NODE_ENV) process.env.NODE_ENV = "dev";
process.env.TS_NODE_PROJECT = require("path").resolve(__dirname, "tsconfig.json");

require("tsconfig-paths").register();
require("./src/index");
