import type { HibikiClient } from "classes/Client";
import type { Guild } from "eris";
import type { FastifyReply, FastifyRequest, RouteHandler, RouteShorthandOptionsWithHandler } from "fastify";
import type { WithId } from "webserver/schemas/common";

export const withGuild =
  (fn: (guild: Guild, req: FastifyRequest<WithId>, res: FastifyReply) => any, bot: HibikiClient): RouteHandler<WithId> =>
  (req, res) => {
    // Checks whether the bot is present on the guild
    const guild = bot.guilds.get(req.params.id);
    if (!guild || guild.permissionsOf(req.user?.id).has("administrator")) {
      res.send(res.err.input("The guild id is invalid or you don't have permissions to manage it."));
      return;
    }

    fn.call(this, guild, req, res);
  };
