import { pino } from "pino";

// Options for the pino logger
// TODO: Implement FS logs
const pinoOptions: pino.LoggerOptions = {
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "yyyy-mm-dd HH:MM:ss",
      colorize: true,
    },
  },
};

// Creates the new Pino logger
const logger = pino(Bun.env["isProduction"] ? {} : pinoOptions);

export default logger;
