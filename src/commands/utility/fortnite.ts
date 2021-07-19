import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class FortniteCommand extends Command {
  description = "Returns Fortnite account stats.";
  requiredkeys = ["fortnite"];
  args = "<username:string> [platform:string]";
  cooldown = 3000;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const username = encodeURIComponent(pargs?.[0]?.value).toLowerCase();
    const platform = pargs?.[1]?.value;

    // Invalid platform
    if (platform !== undefined && !["psn", "xbox", "pc"].includes(platform)) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.FORTNITE_PLATFORMS"), "error");
    }

    // Gets stats
    const body = await axios
      .get(`https://api.fortnitetracker.com/v1/profile/${platform ? encodeURIComponent(platform).toLowerCase() : "pc"}/${username}`, {
        headers: {
          "TRN-Api-Key": `${this.bot.config.keys.fortnite}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {});

    // If nothing was found
    if (!body || !body?.data?.lifeTimeStats || body?.data?.error) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.ACCOUNT_NODATA"), "error");
    }

    const fields: EmbedField[] = [];

    // Total wins
    if (body.data.lifeTimeStats[8]?.value) {
      fields.push({
        name: msg.locale("utility.FORTNITE_WINS"),
        value: body.data.lifeTimeStats[8].value,
        inline: true,
      });
    }

    // Total matches
    if (body.data.lifeTimeStats[7]?.value) {
      fields.push({
        name: msg.locale("utility.FORTNITE_MATCHES"),
        value: body.data.lifeTimeStats[7].value,
        inline: true,
      });
    }

    if (body.data.lifeTimeStats[10]?.value) {
      fields.push({
        name: msg.locale("utility.FORTNITE_KILLS"),
        value: body.data.lifeTimeStats[10].value,
        inline: true,
      });
    }

    // Total score
    if (body.data.lifeTimeStats[6]?.value) {
      fields.push({
        name: msg.locale("utility.OSU_SCORE"),
        value: body.data.lifeTimeStats[6].value,
        inline: true,
      });
    }

    // K/D Ratio
    if (body.data.lifeTimeStats[11]?.value) {
      fields.push({
        name: msg.locale("utility.FORTNITE_RATIO"),
        value: body.data.lifeTimeStats[11].value,
        inline: true,
      });
    }

    // Win percentage
    if (body.data.lifeTimeStats[9]?.value) {
      fields.push({
        name: msg.locale("utility.FORTNITE_PERCENT"),
        value: body.data.lifeTimeStats[9].value,
        inline: true,
      });
    }

    // Sends the stats
    msg.channel.createMessage({
      embed: {
        title: msg.locale("utility.FORTNITE_DATA", { username: body.data.epicUserHandle, platform: body.data.platformNameLong }),
        color: msg.convertHex("general"),
        fields: fields,
        footer: {
          text: `${msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
