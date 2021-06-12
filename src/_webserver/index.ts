import { createFasteer } from "@fasteerjs/fasteer";
import type { HibikiClient } from "classes/Client";
import { RethinkDBStore } from "session-rethinkdb-ts";
import { Liquid } from "liquidjs";
import { getWebLocale, loadIcons } from "../utils/webserver";
import { fastify } from "fastify";
import { lifecycle } from "./lifecycle";
import fastifyAccepts from "fastify-accepts";
import fastifyCsrf from "fastify-csrf";
import fastifyCookie from "fastify-cookie";
import fastifySession from "fastify-session";
import path from "path";
import pointOfView from "point-of-view";
import fastifyStatic from "fastify-static";
import helmet from "helmet";

// The old express webserver. Temporary till this new one is done.
const OLD_WEBSERVER = path.join(__dirname, "..", "webserver");

const isProduction = process.env.NODE_ENV === "production";
const LAYOUTS_DIRECTORY = path.join(OLD_WEBSERVER, "layouts");
const PARTIALS_DIRECTORY = path.join(OLD_WEBSERVER, "partials");
const PUBLIC_DIRECTORY = path.join(OLD_WEBSERVER, "public");
const VIEWS_DIRECTORY = path.join(OLD_WEBSERVER, "views");
const CONTROLLERS_DIRECTORY = path.join(__dirname, "controllers", "**", "*Controller.{ts,js}");

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

  const sessionStore = new RethinkDBStore({
    connectOptions: {
      db: bot.config.database.db,
      password: bot.config.database.password,
      port: bot.config.database.port,
      host: bot.config.database.host,
      user: bot.config.database.user,
      silent: true,
    },
  });

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
    .register(fastifyCookie, {
      prefix: "_hibiki_",
    })
    .register(fastifyCsrf)
    .register(fastifySession, {
      secret: bot.config.dashboard.cookieSecret,
      cookieName: "session",
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        // If you are getting infinite redirects, set this to "false" if you don't have a HTTPS-only environment setup.
        secure: bot.config.dashboard.cookieSecure,
      },
      store: sessionStore,
    })
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
