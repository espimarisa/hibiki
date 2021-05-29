"use strict";
/**
 * Thanks to @maciejmatu https://github.com/TypeStrong/ts-node/issues/676#issuecomment-472913023
 */

const path = require("path");

require("ts-node").register();
require(path.resolve(__dirname, "./Worker.ts"));
