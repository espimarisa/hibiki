import { HibikiEvent, type HibikiEventListener } from "$classes/Event.ts";
import type { ButtonInteraction } from "discord.js";

export class ButtonInteractionEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["interactionCreate"];
  // biome-ignore lint/suspicious/useAwait: Temporary file
  async run(_event: HibikiEventListener[], interaction: ButtonInteraction) {
    // Only run on button interactions
    if (!(interaction.id && interaction.isButton())) {
      return;
    }
  }
}
