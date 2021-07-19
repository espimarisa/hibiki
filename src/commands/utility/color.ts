import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { colorName, colors, rgbToLAB } from "../../utils/colors";

export class ColorCommand extends Command {
  description = "Randomly generates a color or returns hex, LAB, and RGB info for one.";
  args = "[color:string]";
  aliases = ["hex", "colour", "hsv", "hsl", "rgb", "rgba", "lab", "cielab"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const colorQuery = args.join().toLowerCase();
    let color: Record<string, number>;

    // Checks for the color
    const hexcheck = /[#]?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(colorQuery);
    const rgbcheck = /([0-9]{1,3})[, ]{1,2}([0-9]{1,3})[, ]{1,2}([0-9]{1,3})/.exec(colorQuery);
    const namecheck = colors.find((name) => name[2].toLowerCase().startsWith(colorQuery));
    if (hexcheck && !rgbcheck) color = this.hexToRGB(hexcheck[0]);
    else if (rgbcheck)
      color = {
        r: parseInt(rgbcheck[1]),
        g: parseInt(rgbcheck[2]),
        b: parseInt(rgbcheck[3]),
      };
    // Randomly sets a color if no args are given
    else if (!colorQuery) color = this.hexToRGB(Math.floor(Math.random() * 16777215).toString(16));
    else if (namecheck) color = this.hexToRGB(namecheck[0]);
    else if (!color) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.COLOR_INVALID"), "error");

    const hex = this.rgbToHex(color?.r, color.g, color.b);
    const hsv = this.rgbToHSV(color.r / 255, color.g / 255, color.b / 255);
    const lab = rgbToLAB([color.r, color.g, color.b]);

    // Strings
    const hexString = `**HEX**: #${hex.toUpperCase()}\n`;
    const rgbString = `**RGB**: ${color.r}, ${color.b}, ${color.g}\n`;
    const hsvString = `**HSV**: ${hsv[0].toFixed(2)}°, ${(hsv[1] * 100).toFixed(2)}%, ${(hsv[2] * 100).toFixed(2)}\n`;
    const labString = `**LAB**: ${lab[0].toFixed(2)}, ${lab[1].toFixed(2)}, ${lab[2].toFixed(2)}`;

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `🎨 ${colorName(hex)[2]}`,
        description: `${hexString + rgbString + hsvString + labString}`,
        color: parseInt(`0x${hex}`),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }

  // Converts RGB to Hex
  rgbToHex(r: number, g: number, b: number) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Converts hex to RGB
  hexToRGB(hex: string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // RGB to HSV
  rgbToHSV(r: number, g: number, b: number) {
    const v = Math.max(r, g, b),
      c = v - Math.min(r, g, b);
    const h = c && (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
  }
}
