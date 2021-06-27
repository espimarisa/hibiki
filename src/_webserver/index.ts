import { createFasteer } from "@fasteerjs/fasteer";
import type { HibikiClient } from "classes/Client";
import { RethinkDBStore } from "session-rethinkdb-ts";
import { Liquid } from "liquidjs";
import { getWebLocale, loadIcons } from "../utils/webserver";
import { fastify } from "fastify";
import { lifecycle } from "./lifecycle";
import fastifyAccepts from "fastify-accepts";
import fastifyCsrf from "fastify-csrf";
import fastifySecureSession from "fastify-secure-session";
import path from "path";
import pointOfView from "point-of-view";
import fastifyStatic from "fastify-static";
import helmet from "helmet";
import { sessions } from "./lifecycle/sessions";

// The old express webserver. Temporary till this new one is done.
const OLD_WEBSERVER = path.join(__dirname, "..", "webserver");

const isProduction = process.env.NODE_ENV === "production";
const LAYOUTS_DIRECTORY = path.join(OLD_WEBSERVER, "layouts");
const PARTIALS_DIRECTORY = path.join(OLD_WEBSERVER, "partials");
const PUBLIC_DIRECTORY = path.join(OLD_WEBSERVER, "public");
const VIEWS_DIRECTORY = path.join(OLD_WEBSERVER, "views");
const CONTROLLERS_DIRECTORY = path.join(__dirname, "controllers", "**", "*Controller.{ts,js}");
const COOKIE_SECRET_PATH = path.join(__dirname, "..", "..", "hibiki_cookie_secret.key");

export const startWebserver = async (bot: HibikiClient) => {
  const app = createFasteer(
    {
      controllers: CONTROLLERS_DIRECTORY,
      port: bot.config.dashboard.port,
      host: bot.config.dashboard.host,
      helmet: {
        hidePoweredBy: true,
        // @ts-ignore - there are only `helmet` types included, however this is a valid fastify-helmet option.
        // See fasteerjs/fasteer#4.
        enableCSPNonces: true,
        contentSecurityPolicy: {
          directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "cdn.discordapp.com"],
            "script-src": ["'self'"],
          },
        },
      },
      cors: {
        credentials: true,
      },
    },
    fastify({
      trustProxy: bot.config.dashboard.trustProxy,
    }),
  );

  app.logger = bot.log;

  app
    .inject({
      bot,
    })
    .plugin(lifecycle);

  sessions(bot, {
    secretPath: COOKIE_SECRET_PATH,
  })(app);

  const liquid = new Liquid({
    root: [VIEWS_DIRECTORY, PARTIALS_DIRECTORY, LAYOUTS_DIRECTORY],
    cache: isProduction,
    lenientIf: true,
    jsTruthy: true,
    extname: ".liquid",
  });

  loadIcons(liquid);

  app.fastify
    .register(fastifyAccepts)
    .register(fastifyCsrf)
    .register(pointOfView, {
      engine: {
        liquid,
      },
      viewExt: "liquid",
      root: VIEWS_DIRECTORY,
      defaultContext: {
        bot,
        botAvatar: bot.user.dynamicAvatarURL(null, 512),
      },
    })
    .register(fastifyStatic, {
      root: PUBLIC_DIRECTORY,
      prefix: "/public/",
    });

  const addr = await app.start();
  bot.log.info(`Webserver running at ${addr}`);
};
