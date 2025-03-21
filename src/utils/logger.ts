/**
 * @file logger
 * @description Wrapper around Ts.ED logger
 * @author Espi Marisa <contact@espi.me>
 */

import { Logger } from "@tsed/logger";

// Creates the logger
const logger = new Logger("hibiki");
logger.appenders
	.set("stdout", {
		// stdout logger
		type: "stdout",
		levels: ["debug", "info", "trace"],
	})
	.set("stderr", {
		// stderr logger
		type: "stderr",
		levels: ["fatal", "error", "warn"],
		layout: {
			type: "pattern",
			pattern: "%d %p %c %X{user} %m%n",
		},
	});

export { logger };
