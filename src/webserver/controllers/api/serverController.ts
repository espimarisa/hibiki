import { withAuth } from "webserver/lifecycle/middleware/auth";
import { withGuild } from "webserver/resolvers/guild";
import { WithId, withId } from "webserver/schemas/common";
import { transformGuild } from "webserver/transforms";
import type { Controller } from "webserver/types";

const ServerController: Controller = async (app, { bot }) => {
  app.get("/list", withAuth(), async ({ user }, res) =>
    res.send(
      res.ok({
        guilds: user!.guilds
          .map((guild) => transformGuild(guild, bot))
          .filter((guild) => (guild.permissions & 32) === 32 || ((guild.permissions & 8) === 8 && guild.botJoined))
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .sort((g) => (g.botJoined ? -1 : 0))
          .sort((a, b) => (a.botJoined && a.name < b.name ? -1 : 0)),
      }),
    ),
  );

  app.get<WithId>(
    "/:id",
    withAuth({ schema: withId }),
    withGuild((guild, _, res) => {
      const textChannels = [];

      const voiceChannels = [];

      // TODO: Simplify logic
      for (const [, channel] of guild.channels) {
        if (channel.type === 0 && channel.permissionsOf(bot.user.id).has("sendMessages")) {
          textChannels.push(channel);
          continue;
        }

        if (channel.type === 2 && channel.permissionsOf(bot.user.id).has("voiceSpeak")) {
          voiceChannels.push(channel);
          continue;
        }
      }

      const roles = bot.guilds
        .get(guild.id)
        .roles.map((r) => ({ name: r.name, managed: r.managed, color: r.color.toString(16), id: r.id }))
        .filter((r) => r.managed !== true && r.name !== "@everyone");

      res.send(
        res.ok({
          guildInfo: transformGuild(guild, bot),
          textChannels,
          voiceChannels,
          roles,
          config: bot.db.getGuildConfig(guild.id),
        }),
      );
    }, bot),
  );

  app.post<WithId>("/:id/manage", withAuth({ schema: withId }), async ({ params }, res) => {
    // TODO: implement
    res.send(res.err.internal("todo"));
  });

  app.post<WithId>(
    "/:id/leave",
    withAuth({ schema: withId }),
    withGuild(async (guild, _, res) => {
      await guild.leave();
      res.ok();
    }, bot),
  );
};

export const routePrefix = "/server";

export default ServerController;
