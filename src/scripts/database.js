/**
 * @fileoverview Database
 * @description Various RethinkDB scripts to run
 * @module database
 */

const { r } = require("rethinkdb-ts");
const { statSync, readFileSync } = require("fs");
const config = require("../../config");
const log = require("./logger");
let docker;

// Hacky function to figure out if we're running in Docker
function isDocker() {
  function hasDockerEnv() {
    try {
      statSync("/.dockerenv");
      return true;
    } catch (err) {
      return false;
    }
  }

  function hasDockerCGroup() {
    try {
      return readFileSync("/proc/self/cgroup", "utf8").includes("docker");
    } catch (err) {
      return false;
    }
  }

  if (docker === undefined) {
    docker = hasDockerEnv() || hasDockerCGroup();
    return docker;
  }
}

/**
 * Starts RethinkDB with configured options
 * @await
 *
 * @example
 * const start = require("../scripts/database").start;
 * await start();
 */

module.exports.start = async function database() {
  await r.connectPool({
    db: config.rethink.db,
    servers: isDocker() === true ? [{ host: "db" }] : [{ host: "localhost" }],
    password: config.rethink.password,
    port: config.rethink.port,
    user: config.rethink.user ? config.rethink.user : "admin",
    silent: true,
  }).catch(err => {
    console.error(err);
    log.error(`Error while starting the database, exiting: ${err}`);
    process.exit(1);
  });
};
