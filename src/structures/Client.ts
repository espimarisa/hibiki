/**
 * @fileoverview Client
 * @description Connects to Discord and handles global bot functions
 * @author Espi <contact@espi.me>
 */

import { Client } from "eris";
import { Handler } from "./Handler";
import { Command } from "./Command";
import { loadItems } from "../scripts/loader";
import { createEmbed, editEmbed, embedColor } from "../helpers/embed";

export class hibikiClient extends Client {
  cooldowns: Array<string>;
  commands: Array<Command> = [];
  handler: Handler;
  createEmbed: typeof createEmbed;
  editEmbed: typeof editEmbed;
  embedColor: typeof embedColor;

  constructor(token: string, options: Record<string, unknown>) {
    super(token, options);

    this.cooldowns = [];
    this.commands = [];

    // pollution? who the hell cares
    this.createEmbed = createEmbed;
    this.editEmbed = editEmbed;
    this.embedColor = embedColor;

    this.handler = new Handler(this);

    this.connect();
    this.once("ready", () => this.readyListener());
  }

  async readyListener(): Promise<void> {
    await loadItems(this);
    console.info(`Logged in as ${this.user.username}#${this.user.discriminator} on ${this.guilds.size} guilds.`);
    // TODO: Get this to report the proper amount of modules. works in commands, not here or the loader.
    // maybe a timing issue? async so good!
    console.info(`${this.commands.length} commands have been loaded!`);
  }
}
