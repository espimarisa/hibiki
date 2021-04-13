import type { Dayjs } from "dayjs";
import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export class TimeforCommand extends Command {
  description = "Retuns the current time for a member if they have a timezone set.";
  args = "<member:member&fallback>";
  aliases = ["time", "tz"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const userConfig = await this.bot.db.getUserConfig(member.id);

    let timezone: Dayjs | string;
    if (userConfig?.timezone && !userConfig?.timezoneHide) {
      const currentTime = new Date();
      if (userConfig.timezone) timezone = dayjs(currentTime).tz(userConfig.timezone);
      if (!timezone || !(timezone as any).$d) timezone = null;
      else timezone = dateFormat((timezone as any).$d, msg.string);
    }

    if (!timezone)
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.TIMEFOR_NOTSET", { member: member.user.username }), "error");

    msg.createEmbed(
      `⌚ ${msg.string("utility.TIMEFOR")}`,
      msg.string("utility.TIMEFOR_TIME", {
        member: member.user.username,
        time: timezone,
      }),
    );
  }
}
