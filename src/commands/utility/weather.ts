import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class WeatherCommand extends Command {
  description = "Returns weather information for a location.";
  requiredkeys = ["weather"];
  args = "<location:string>";
  aliases = ["forecast"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));
    const location = await axios.get(`https://nominatim.openstreetmap.org/search/${query}/?format=geocodejson`).catch(() => {});

    // If location not found
    if (!location || !location.data || !location.data.features?.[0]?.geometry?.coordinates) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.WEATHER_NOTFOUND"), "error");
    }

    // Gets coordinates & name
    const loc = location.data.features[0];
    const latitude = loc.geometry.coordinates[1];
    const longitude = loc.geometry.coordinates[0];

    // Removes nonlatin names
    let name = loc.properties.geocoding.name.replace(/[\u0250-\ue007]/g, "");
    if (!name || !name.length) name = `${args.join(" ").replace(",", " ")}`;

    // Weather info
    const body = await axios
      .get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.bot.config.keys.weather}`,
      )
      .catch(() => {});

    // If no weather data is found
    if (!body || !body.data || !body.data.current) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.WEATHER_NOTFOUND"), "error");
    }

    // Embed fields
    const fields: EmbedField[] = [];

    // Current temperature
    if (body.data.current?.temp)
      fields.push({
        name: msg.string("utility.WEATHER_TEMPERATURE"),
        value: `${body.data.current.temp.toFixed(0)}°c`,
        inline: true,
      });

    // Feels like
    if (body.data.current?.feels_like)
      fields.push({
        name: msg.string("utility.WEATHER_FEELSLIKE"),
        value: `${body.data.current.feels_like.toFixed(0)}°c`,
        inline: true,
      });

    // Humidity
    if (body.data.current?.humidity)
      fields.push({
        name: msg.string("utility.WEATHER_HUMIDITY"),
        value: `${body.data.current.humidity.toFixed(0)}%`,
        inline: true,
      });

    // Max
    if (body.data.daily?.[0]?.temp?.max)
      fields.push({
        name: msg.string("global.HIGH"),
        value: `${body.data.daily[0].temp.max.toFixed(0)}°c`,
        inline: true,
      });

    // Min
    if (body.data.daily?.[0]?.temp?.min)
      fields.push({
        name: msg.string("global.LOW"),
        value: `${body.data.daily[0].temp.min.toFixed(0)}°c`,
        inline: true,
      });

    // Wind speed
    if (body.data.current?.wind_speed)
      fields.push({
        name: msg.string("utility.WEATHER_WINDSPEED"),
        value: `${body.data.current.wind_speed.toFixed(1)}km/h`,
        inline: true,
      });

    msg.channel.createMessage({
      embed: {
        title: `☁ ${name}`,
        description: `${body.data.current.weather?.[0]?.main} (${body.data.current.weather?.[0]?.description})`,
        color: msg.convertHex("general"),
        fields: fields,
        thumbnail: {
          url: `http://openweathermap.org/img/wn/${body.data.current?.weather?.[0]?.icon}@2x.png`,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
