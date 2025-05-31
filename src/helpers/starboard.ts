/**
 * @file Starboard functionality helpers.
 * @license zlib
 */

import { captureException, logger } from "@sentry/bun";
import type {
  Client,
  Message,
  MessageReaction,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { DiscordAPIError, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "@/db/services/guildConfig.ts";
import {
  addStarReaction,
  createStarboardEntry,
  deleteStarboardEntry,
  getStarboardEntry,
  hasUserStarred,
  removeStarReaction,
} from "@/db/services/starboard.ts";
import { getTextChannel } from "@/helpers/discord.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { trimContent } from "@/utils/format.ts";
import { starboardLog } from "@/utils/logger.ts";

export const STAR_EMOJI = "⭐";
export const DEFAULT_THRESHOLD = 3;

/**
 * Creates a starboard embed.
 * @param message The message object to parse.
 * @param starCount The total amount of stars.
 * @returns A generated starboard embed object.
 */

function createStarEmbed(message: Message | PartialMessage, starCount: number) {
  if (message.partial) {
    return {};
  }

  const embed = new EmbedBuilder()
    .setDescription(trimContent(message.content, "EmbedDescription", true))
    .setColor(HibikiColors.Starboard)
    .setTimestamp(message.createdAt)
    .setAuthor({
      iconURL: message.author.displayAvatarURL(),
      name: `${message.author.displayName ? `${message.author.displayName} (${message.author.username})` : message.author.username}`,
      url: message.url,
    })
    .setFooter({
      text: `${STAR_EMOJI} ${starCount}`,
    });

  // Adds the first image to the embed if it exists.
  const firstAttachment = message.attachments.find((attachment) =>
    attachment.contentType?.startsWith("image/"),
  );

  // Sets the attachment.
  if (firstAttachment) {
    embed.setImage(firstAttachment.url);
  } else if (message.embeds?.[0]?.image) {
    embed.setImage(message.embeds[0].image.url);
  }

  return embed;
}

/**
 * Sends a starboard message to a channel.
 * @param client A ready Discord.js client instance.
 * @param message The message object to post starboard data about.
 * @param channelID The starboard channel ID to send a message to.
 * @param starCount The total number of stars.
 * @returns A promise resolving to the message object of the starboard message or undefined.
 */

async function sendStarMessage(
  client: Client<true>,
  message: Message | PartialMessage,
  channelID: string,
  starCount: number,
) {
  // Gets the starboard channel.
  const channel = await getTextChannel(client, channelID);
  if (!channel) {
    return;
  }

  try {
    // Creates the starboard embed.
    const embed = createStarEmbed(message, starCount);
    if (Object.keys(embed).length === 0) {
      return;
    }

    // Sends the starboard message.
    const starboardMessage = await channel.send({
      embeds: [embed],
    });

    starboardLog.debug(
      `Sent starboard message ${starboardMessage.id} for ${message.id} in ${channelID}.`,
    );

    return starboardMessage;
  } catch (err) {
    starboardLog.warn(
      err,
      `Failed to send starboard message ${message.id} to ${channelID}.`,
    );

    captureException(err, {
      extra: {
        messageID: message.id,
        starboardChannelID: channelID,
      },
    });

    return;
  }
}

/**
 * Edits a starboard message.
 * @param client A ready Discord.js client instance.
 * @param channelID The channel ID of the starboard channel.
 * @param entryID The message ID of the starboard message to edit.
 * @param starCount The total number of stars.
 * @returns A promise resolving to a boolean indicating success or failure.
 */

async function editStar(
  client: Client<true>,
  channelID: string,
  entryID: string,
  starCount: number,
) {
  // Gets the starboard channel.
  const channel = await getTextChannel(client, channelID);
  if (!channel) {
    return false;
  }

  try {
    // Gets the message and original embed content.
    const message = await channel.messages.fetch(entryID);
    const originalEmbed = message.embeds?.[0];
    if (!originalEmbed) {
      starboardLog.debug(`No embed found for ${entryID}.`);
      return;
    }

    // Updates the starboard entry.
    const embed = createStarEmbed(message, starCount);
    await message.edit({ embeds: [embed] });

    starboardLog.debug(
      `Updated starboard entry message ${entryID} count to ${starCount}.`,
    );

    return true;
  } catch (err) {
    starboardLog.warn(err, `Failed editing message ${entryID}.`);

    // Unknown message; return true since we *technically* are OK with this.
    if (err instanceof DiscordAPIError && err.code === 10_008) {
      starboardLog.debug(`Starboard message ${entryID} not found to edit.`);
      return true;
    }

    captureException(err, {
      extra: {
        starboardMessageId: entryID,
        starboardChannelId: entryID,
        newStarCount: starCount,
      },
    });

    return false;
  }
}

/**
 * Deletes a starboard message.
 * @param client A ready Discord.js client instance.
 * @param channelID The starboard channel ID.
 * @param messageID The message ID of the starboard message to delete.
 * @returns A boolean indicating success or failure.
 */

async function deleteStar(
  client: Client<true>,
  channelID: string,
  messageID: string,
) {
  // Gets the starboard channel.
  const channel = await getTextChannel(client, channelID);
  if (!channel) {
    return false;
  }

  try {
    // Fetches the messages and attempts to delete the message.
    const message = await channel.messages.fetch(messageID);
    await message.delete();
    starboardLog.debug(`Deleted ${messageID} in ${channelID}.`);
    return true;
  } catch (err) {
    // Unknown message handler; likely deleted.
    if (err instanceof DiscordAPIError && err.code === 10_008) {
      starboardLog.debug(`${messageID} has already been deleted.`);
      return true;
    }

    starboardLog.error(err, `Failed to delete ${messageID} in ${channelID}.`);
    captureException(err, {
      extra: {
        starboardMessageId: messageID,
        starboardChannelId: channelID,
      },
    });

    return false;
  }
}

/**
 * Handles star reactions being added.
 * @param reaction The reaction to handle.
 * @param user The user that added a star reaction.
 * @param message The message object a reaction was added on.
 */

export async function handleStarAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  message: Message | PartialMessage,
) {
  // Do not handle non-star reactions or DMs.
  if (!message.guild || reaction.emoji.name !== STAR_EMOJI) {
    return;
  }

  // Ignore bot and client stars.
  if (user.bot || reaction.me) {
    starboardLog.debug(`Ignoring bot star from user ${user.id}.`);
    return;
  }

  starboardLog.debug(
    `Star add detected from user ${user.id} on message ${message.id} in guild ${message.guild.id}.`,
  );

  // Fetches the guild config.
  const config = await getGuildConfig(message.guild.id);
  const starboardChannelID = config?.starboard_channel;
  if (!starboardChannelID) {
    starboardLog.debug(
      `Guild ${message.guild.id} has no starboard_channel set.`,
    );

    return;
  }

  // Ignores reactions inside of the starboard channel.
  if (message.channel.id === starboardChannelID) {
    starboardLog.debug(
      `Ignoring star inside starboard_channel ${starboardChannelID}.`,
    );

    return;
  }

  // Ignores self-stars.
  if (message.author?.id === user.id) {
    starboardLog.debug(`Ignoring self-star from ${user.id}.`);
    return;
  }

  // Checks to see if a user has already starred a message.
  const alreadyStarred = await hasUserStarred(message.id, user.id);
  if (alreadyStarred) {
    starboardLog.debug(
      `User ${user.id} already starred message ${message.id}, ignoring.`,
    );

    return;
  }

  // Adds the star reaction to the database.
  const currentStars = await addStarReaction(message.id, user.id);
  if (currentStars === -1) {
    starboardLog.debug(
      `Failed to add star reaction by user ${user.id} for message ${message.id}.`,
    );

    return;
  }

  // Determines the starboard threshold.
  starboardLog.debug(`Message ${message.id} now has ${currentStars} stars.`);
  const threshold = config.starboard_count || DEFAULT_THRESHOLD;

  // Checks to see if the threshold has been met.
  if (currentStars < threshold) {
    logger.debug(
      `Message ${message.id}'s star count ${currentStars} is below the threshold of ${threshold}.`,
    );

    return;
  }

  // Checks to see if a starboard entry exists for the message.
  const existingEntry = await getStarboardEntry(message.id);
  if (existingEntry) {
    starboardLog.debug(
      `Message ${message.id} already has a starboard entry, updating.`,
    );

    // Edits the starboard message.
    await editStar(
      reaction.client,
      starboardChannelID,
      existingEntry.starboard_message_id,
      currentStars,
    );
  } else {
    // Creates a starboard message.
    const starboardMessage = await sendStarMessage(
      reaction.client,
      message,
      starboardChannelID,
      currentStars,
    );

    // Do not continue of the message failed to post.
    if (!starboardMessage) {
      starboardLog.warn(
        `Failed to send starboard message ${message.id} to starboard channel ${starboardChannelID}.`,
      );

      return;
    }

    // Creates a new starboard entry after the message is sent.
    await createStarboardEntry(
      message.guild.id,
      message.id,
      starboardMessage.id,
    );
  }
}

/**
 * Handles star reactions being removed.
 * @param reaction The reaction to handle.
 * @param user The user that added a star reaction.
 * @param message The message object a reaction was removed from.
 */

export async function handleStarRemove(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  message: Message | PartialMessage,
) {
  // Ignore reactions in DMs or from bots/self.
  if (!message?.guild || user.bot || reaction.me) {
    return;
  }

  // Do not handle non-star reactions.
  if (reaction.emoji.name !== STAR_EMOJI) {
    return;
  }

  starboardLog.debug(
    `Star removal detected from user ${user.id} on message ${message.id} in guild ${message.guild.id}.`,
  );

  // Gets the guild's config.
  const config = await getGuildConfig(message.guild.id);
  const starboardChannelID = config?.starboard_channel;
  if (!starboardChannelID) {
    return;
  }

  // Ignores reactions in the starboard channel.
  if (message.channel.id === starboardChannelID) {
    return;
  }

  // Removes the star reaction and gets the current count.
  const currentStars = await removeStarReaction(message.id, user.id);

  // Do not continue further if the reaction failed to remove.
  if (currentStars === -1) {
    starboardLog.error(
      `Failed to remove star reaction by user ${user.id} for message ${message.id}.`,
    );

    return;
  }

  starboardLog.debug(`Message ${message.id} now has ${currentStars} stars.`);

  // Checks for an existing starboard entry.
  const existingEntry = await getStarboardEntry(message.id);
  if (!existingEntry) {
    starboardLog.debug(
      `Message ${message.id} has no existing starboard entry.`,
    );
    return;
  }

  // Checks the threshold to decide if we should delete the message.
  const threshold = config.starboard_count || DEFAULT_THRESHOLD;
  if (currentStars < threshold) {
    starboardLog.debug(
      `Message ${message.id}'s star count dropped below the threshold of ${threshold}, deleting post.`,
    );

    // Deletes the entry from the starboard.
    const deletedMessage = await deleteStar(
      reaction.client,
      starboardChannelID,
      existingEntry.starboard_message_id,
    );

    // Updates the database.
    const deletedStar = await deleteStarboardEntry(message.id);

    // Log if either update failed.
    if (!(deletedMessage && deletedStar)) {
      starboardLog.error(
        `Failed to fully remove starboard entry for message ${message.id}, Discord: ${deletedMessage}, DB: ${deletedStar}.`,
      );
    }
  } else {
    // Edits the existing starboard message.
    await editStar(
      reaction.client,
      starboardChannelID,
      existingEntry.starboard_message_id,
      currentStars,
    );
  }
}
