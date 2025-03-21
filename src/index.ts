/**
 * @file index
 * @description Creates a new Hibiki sharder
 * @author Espi Marisa <contact@espi.me>
 */

import { HibikiSharder } from "$classes/HibikiSharder.ts";
import { env } from "$utils/env.ts";

// Creates a new sharding manager
const manager = new HibikiSharder(
	`${import.meta.dir}/hibiki.ts`,
	"auto",
	env.DISCORD_TOKEN,
);

manager.spawn();
