/**
 * @file Setup
 * @description Sets up RethinkDB
 * @module utils/setup
 */

import { r } from "rethinkdb-ts";
import { startRethink } from "../classes/RethinkDB";
import config from "../../config.json";
import { botLogger } from "../helpers/logger";

const requiredtables = [
  "blacklist",
  "economy",
  "guildconfig",
  "marriages",
  "monitoring",
  "mutecache",
  "points",
  "reminders",
  "session",
  "steammonitor",
  "userconfig",
  "warnings",
];

export async function setupRethink() {
  await startRethink().catch((err) => {
    botLogger.error(`RethinkDB failed to start. Be sure the config file is setup properly and that it's running. Exiting. (error: ${err})`);
    process.exit(1);
  });

  const db = r.db(config.database.db);
  const dbList = await r.dbList().run();
  if (!dbList.includes(config.database.db)) {
    await r.dbCreate(config.database.db).run();
    botLogger.info(`Created the ${config.database.db} database`);
  }

  // Creates missing tables
  const tables = await db.tableList().run();
  await Promise.all(
    requiredtables.map(async (t) => {
      if (!tables.includes(t)) {
        await db.tableCreate(t).run();
        botLogger.info(`Created the ${t} table`);
      }
    }),
  );

  // Creates marriage index
  const index = await db.table("marriages").indexList().run();
  if (!index.includes("marriages")) {
    await db
      .table("marriages")
      .indexCreate("marriages", [r.row("id"), r.row("spouse")], { multi: true })
      .run();
    botLogger.info("Created the marriage index");
  }

  botLogger.info("RethinkDB is setup properly");
}

if (require.main === module) {
  setupRethink().then(() => process.exit(0));
}
