/**
 * @fileoverview Database
 * @description Various RethinkDB scripts to run
 * @module database
 */

const { r } = require("rethinkdb-ts");
const docker = require("../utils/docker");
const config = require("../../config");
const log = require("./logger");

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
    password: config.rethink.password,
    port: config.rethink.port,
    host: docker === true ? "db" : config.rethink.host,
    user: config.rethink.user ? config.rethink.user : "admin",
    silent: true,
  }).catch(err => {
    log.error(`Error while starting the database, exiting: ${err}`);
    process.exit(1);
  });

  await r.db(config.rethink.db).wait();
};
