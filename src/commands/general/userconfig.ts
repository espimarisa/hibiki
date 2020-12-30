// import type { Message, TextChannel } from "eris";
// import { Command } from "../../classes/Command";
// import { validItems } from "../../utils/items";
// import { waitFor } from "../../utils/waitFor";

// const items = validItems.filter((item) => item.category === "Profile");

// export class UserConfigCommand extends Command {
//   description = "Updates your profile's configuration.";
//   aliases = ["profileconfig", "usercfg"];
//   cooldown = 5000;
//   allowdisable = false;

//   async run(msg: Message<TextChannel>) {
//     const omsg = await msg.channel.createMessage({
//       embed: {
//         title: "loli with peniss",
//         fields: items.map((item) => ({
//           name: `${item.emoji} ${item.label}`,
//           value: item.type,
//         }),
//         color: msg.convertHex("general"),
//       },
//     });
//     items.forEach(item => omsg.addReaction(item.emoji));

//     await waitFor("messageReactionAdd", 15000, (m: Message, emoji: any, user: Member) => {
//       if (m.id !== msg.id) return;
//       if (user.id != msg.author.id) return;
//       if (!emoji.name) return;

//       const item = items.find(item => item.emoji === emoji.name);
//       if(!item) return;
//       omsg.editEmbed()
//     }, this.bot);
//   }
// }
