/**
 * @fileoverview Database
 * @description Various RethinkDB scripts to run
 * @module database
 */

const { r } = require("rethinkdb-ts");
const config = require("root/config");
const log = require("scripts/logger");

/**
 * Starts RethinkDB with configured options
 * @await
 *
 * @example
 * const start = require("scripts/database").start;
 * await start();
 */

module.exports.start = async function database() {
  await r.connectPool({
    db: config.rethink.db,
    host: config.rethink.host,
    password: config.rethink.password,
    port: config.rethink.port,
    user: config.rethink.user ? config.rethink.user : "admin",
    silent: true,
  }).catch(err => {
    log.error(`Error while starting the database, exiting: ${err}`);
    process.exit(1);
  });
};
