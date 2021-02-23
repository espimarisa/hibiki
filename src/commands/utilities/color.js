const Command = require("../../structures/Command");
const colorList = require("../../utils/colors");

class colorCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["colour", "hex", "hexcode", "hexcolor", "hexcolour", "hsl", "hsv"],
      args: "[color:string]",
      description: "Previews a hex or generates a random color.",
      allowdms: true,
    });
  }

  run(msg, args) {
    args = args.join();
    let color;

    // Checks for the color
    const hexcheck = /[#]?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(args);
    const rgbcheck = /([0-9]{1,3})[, ]{1,2}([0-9]{1,3})[, ]{1,2}([0-9]{1,3})/.exec(args);
    const namecheck = colorList.names.find(name => name[1].toLowerCase().startsWith(args.toLowerCase()));
    if (hexcheck && !rgbcheck) color = this.hexToRGB(hexcheck[0]);
    else if (rgbcheck) color = {
      r: parseInt(rgbcheck[1]),
      g: parseInt(rgbcheck[2]),
      b: parseInt(rgbcheck[3]),
    };

    // Randomly sets a color if no args are given
    else if (!args) color = this.hexToRGB(Math.floor(Math.random() * 16777215).toString(16));
    else if (namecheck) color = this.hexToRGB(namecheck[0]);
    else if (!color) return this.bot.embed("❌ Error", "Invalid hex or color.", msg, "error");
    const hex = this.rgbToHex(color.r, color.g, color.b);
    const hsv = this.rgbToHSV(color);

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `🎨 ${colorList.name(hex)[1]}`,
        description: `**RGB**: ${color.r}, ${color.g}, ${color.b}\n**HSV**: ${hsv.h}°, ${hsv.s}%, ${hsv.v}%\n**Hex**: #${hex.toUpperCase()}`,
        color: parseInt(`0x${hex}`),
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }

  // Converts RGB to Hex
  rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Converts hex to RGB
  hexToRGB(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  // Converts between RGB & RSV
  rgbToHSV(rgb) {
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;
    let rr, gg, bb, h, s, v, diff;
    const rabs = r / 255;
    const gabs = g / 255;
    const babs = b / 255;
    v = Math.max(rabs, gabs, babs),
      diff = v - Math.min(rabs, gabs, babs);
    const diffc = c => (v - c) / 6 / diff + 1 / 2;
    const percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff === 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rr = diffc(rabs);
      gg = diffc(gabs);
      bb = diffc(babs);
      if (rabs === v) {
        h = bb - gg;
      } else if (gabs === v) {
        h = 1 / 3 + rr - bb;
      } else if (babs === v) {
        h = 2 / 3 + gg - rr;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return {
      h: Math.round(h * 360),
      s: percentRoundFn(s * 100),
      v: percentRoundFn(v * 100),
    };
  }
}

module.exports = colorCommand;
