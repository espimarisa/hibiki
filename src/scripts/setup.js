/**
 * @fileoverview RethinkDB Setup
 * @description Creates the required database and tables
 */

const { r } = require("rethinkdb-ts");
const config = require("root/config");
const log = require("scripts/log");
const start = require("scripts/database").start;
const requiredtables = config.rethink.tables;

(async () => {
  await start().catch(err => {
    log.error(`Error while starting RethinkDB (Is it running; are you authed right?): ${err}`);
    process.exit();
  });

  // Creates database
  const db = r.db(config.rethink.db);
  const dbList = await r.dbList().run();
  if (!dbList.includes(config.rethink.db)) {
    await r.dbCreate(config.rethink.db).run();
    log.success(`Created the ${config.rethink.db} database`);
  }

  // Creates tables
  const tables = await db.tableList().run();
  await Promise.all(requiredtables.map(async t => {
    if (!tables.includes(t)) {
      await db.tableCreate(t).run();
      log.success(`Created the ${t} table`);
    }
  }));

  // Creates marriage index
  if (config.rethink.marriages) {
    const index = await db.table("marriages").indexList().run();
    if (!index.includes("marriages")) {
      await db.table("marriages").indexCreate("marriages", [r.row("id"), r.row("spouse")], { multi: true }).run();
      log.success("Created the marriage index");
    }
  }

  log.success("RethinkDB has been setup properly.");
  process.exit(0);
})();
