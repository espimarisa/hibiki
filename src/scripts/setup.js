const { rethink } = require("../../config");
const log = require("../Log");
let db;

process.on("unhandledRejection", () => {
  log.error("RethinkDB isn't configured or running properly.");
  process.exit();
});

// Ends the script if an error happened
try { db = require("rethinkdbdash")(rethink); } catch (e) {
  log.error("Either modules aren't installed or RethinkDB isn't configured properly.");
  process.exit();
}

const requiredTables = rethink.tables;

(async () => {
  // Creates the database if it doesn't exist
  const dbList = await db.dbList();
  if (!dbList.includes(rethink.db)) {
    await db.dbCreate(rethink.db);
    log.success(`Created the ${rethink.db} database`);
  }

  // Creates the tables that don't exist
  const tables = await db.tableList();
  await Promise.all(requiredTables.map(async t => {
    if (!tables.includes(t)) {
      await db.tableCreate(t);
      log.success(`Created the ${t} table`);
    }
  }));

  // Creates the marriage index
  if (rethink.marriages) {
    const index = await db.table("marriages").indexList();
    if (!index.includes("marriages")) {
      await db.table("marriages").indexCreate("marriages", [db.row("id"), db.row("spouse")], { multi: true });
      log.success(`Created the marriages index in the marriage table`);
    }
  }

  log.success("RethinkDB is configured properly.");
  process.exit(0);
})();
