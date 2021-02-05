import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class FactCommand extends Command {
  description = "Posts a cat, dog, or random fact.";
  args = "[cat:string] | [dog:string] | [useless:string]";
  aliases = ["catfact", "dogfact", "randomfact", "uselessfact"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // APIs to search
    const apis = ["https://catfact.ninja/fact", "https://dog-api.kinduff.com/api/facts", "https://useless-facts.sameerkumar.website/api"];

    // API strings
    const apinames = ["cat", "dog", "useless"];
    const apilabels = [`🐱 ${msg.string("fun.FACT_CAT")}`, `🐶 ${msg.string("fun.FACT_DOG")}`, `🍀 ${msg.string("fun.FACT_USELESS")}`];
    let index = Math.floor(Math.random() * apis.length);

    // Gets an API to use
    if (args.length > 0 && apinames.filter((api) => api.includes(args.join(" "))).length) {
      index = apinames.indexOf(apinames.filter((api) => api.includes(args.join(" ")))[0]);
    }

    // Finds the API
    const api = apis[index];
    const apiname = apinames[index];
    const apilabel = apilabels[index];
    let fact = "";

    // Gets the fact data
    const body = await axios.get(api).catch(() => {});

    // Gets what API to send in the message
    if (!body || !body.data) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.FACT_ERROR"), "error");
    if (apiname === "cat") fact = body.data.fact;
    else if (apiname === "dog") fact = body.data.facts[0];
    else if (apiname === "useless") fact = body.data.data;

    // Sends the fact
    msg.createEmbed(apilabel, fact);
  }
}
