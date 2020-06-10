/**
 * @fileoverview Database scripts
 * @description Scripts for RethinkDB functionality
 */

const { r } = require("rethinkdb-ts");
const config = require("root/config");

module.exports.start = async function database() {
  await r.connectPool({
    db: config.rethink.db,
    host: config.rethink.host,
    password: config.rethink.password,
    port: config.rethink.port,
    user: config.rethink.user ? config.rethink.user : "admin",
  });
};
