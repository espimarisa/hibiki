import type { FastifyInstance } from "fastify";
import archiver from "archiver";
import { randomBytes } from "node:crypto";

export default class WebInternalApi {
  // private app: FastifyInstance;
  // private bot: Discord.Client;
  private gdprStore: GdprStore = {};
  private interval: NodeJS.Timeout;
  private app?: FastifyInstance
  private registeredRoutes = false;

  constructor() {
    // this.registerGdprRoutes();
    // Every hour
    this.interval = setTimeout(this._checkGdprData, 1000 * 60 * 60);
  }

  public async init(app: FastifyInstance) {
    this.app = app;
    this.registerGdprRoutes();
    this.registeredRoutes = true;
  }

  public async generateGdprData(data: GdprData, options: GdprDataOptions): Promise<generateGdprDataResponse> {
    if (!this.registeredRoutes || !this.app) {
      throw new RoutesNotRegistedError();
    }

    const id = randomBytes(9).toString("hex");
    const expires = new Date(options?.expires || Date.now() + 1000 * 60 * 60 * 24);
    const initiatedAt = new Date();

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // For each key in the data object, Stringify it and add it to the archive with the key as its filename.json
    Object.keys(data).forEach((key: string) => {
      archive.append(JSON.stringify(data[key], undefined, " "), { name: `${key}.json` });
    });

    const buffer = Buffer.from(await archive.read());

    this.gdprStore[id] = {
      data: buffer,
      expires,
      initiatedAt,
      initiatedBy: options?.initiatedBy,
    };

    return {
      id,
      expires,
      url: `${this.app.config.baseURL}/gdpr/${id}`,
      deletion_url: `${this.app.config.baseURL}/gdpr/${id}/delete`,
    };
  }

  private async registerGdprRoutes() {
    const res404 = {
      success: false,
      message: "GDPR not found or has expired.",
    };
    if (!this.app) {
      throw new RoutesNotRegistedError();
    }
    /**
     * @api {get} /api/gdpr/:id Get GDPR data
     * @apiName GetGdprData
     * @apiGroup WebInternalApi
     */
    this.app.get<{
      Params: {
        id: string;
      };
    }>("/gdpr/:id", async (req, res) => {
      const id = req.params.id;
      const gdpr = this.gdprStore[id];

      if (!gdpr) {
        res.send(res404);
        return;
      }

      // Compare dates
      const now = new Date();
      if (now > gdpr.expires) {
        res.send(res404);
        delete this.gdprStore[id];
        return;
      }

      // if the path ends with /delete
      if (req.url.endsWith("/delete")) {
        delete this.gdprStore[id];
        res.send({
          success: true,
          message: "GDPR data deleted.",
        });
        return;
      }

      // mm-dd-yyyy
      const dated = gdpr.initiatedAt
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");

      if (gdpr.initiatedBy) {
        res.header("X-Archive-Requester", gdpr.initiatedBy);
      }

      res.header("Content-Type", "application/zip");
      res.header("Content-Disposition", `attachment; filename="hibiki-${dated}-${id}.zip"`);
      res.send(gdpr.data);
    });
  }

  private _checkGdprData() {
    Object.keys(this.gdprStore).forEach((key: string) => {
      const item = this.gdprStore[key];
      if (item.expires < new Date()) {
        delete this.gdprStore[key];
      }
    });
  }
}

export class RoutesNotRegistedError extends Error {
  constructor() {
    super("Routes not registered. Call init(fastifyApp) first.");
    this.name = "RoutesNotRegistedError";
  }
}