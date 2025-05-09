/**
 * @file Starboard functionality helpers.
 * @license Zlib
 */

import { getGuildConfig } from "@/db/services/guildConfig.ts";
import {
  addStarReaction,
  createStarboardEntry,
  deleteStarboardEntry,
  getStarboardEntry,
  hasUserStarred,
  removeStarReaction,
} from "@/db/services/starboard.ts";
import { getValidTextChannel } from "@/helpers/discord.ts";
import { HibikiColors, MessageLimits } from "@/utils/constants.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { starboardLog } from "@/utils/logger.ts";
import { logger } from "@sentry/bun";
import {
  type Client,
  DiscordAPIError,
  EmbedBuilder,
  type Message,
  type MessageReaction,
  type User,
} from "discord.js";

export const STAR_EMOJI = "⭐";
export const DEFAULT_THRESHOLD = 3;

/**
 * Creates a starboard embed.
 * @param message The message object to parse starboard data for.
 * @param starCount The total amount of stars to set on the embed.
 * @returns A generated starboard embed.
 */

function createStarEmbed(message: Message, starCount: number) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${message.author.displayName ? `${message.author.displayName} (${message.author.username})` : message.author.username}`,
      iconURL: message.author.displayAvatarURL(),
      url: message.url,
    })
    .setDescription(
      message.content.length > MessageLimits.EmbedDescription
        ? `${message.content.substring(0, MessageLimits.EmbedDescription - 20)}...`
        : message.content,
    )
    .setColor(HibikiColors.Starboard)
    .setTimestamp(message.createdAt)
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
 * Posts a starboard message to a channel.
 * @param client A Discord.js client instance.
 * @param message The message object to post starboard data about.
 * @param starboardChannelID The starboard channel ID to send a message to.
 * @param starCount The total number of stars.
 * @returns A message object of the newly sent starboard message.
 */

async function sendStar(
  client: Client<true>,
  message: Message,
  starboardChannelID: string,
  starCount: number,
) {
  // Gets the starboard channel and content.
  const channel = await getValidTextChannel(client, starboardChannelID);
  if (!channel) {
    return;
  }

  try {
    const embed = createStarEmbed(message, starCount);

    // Sends the starboard message.
    const starboardMessage = await channel.send({
      embeds: [embed],
    });

    starboardLog.debug(
      `Posted starboard message ${starboardMessage.id} for original message ${message.id} in channel ${starboardChannelID}.`,
    );

    return starboardMessage;
  } catch (err) {
    const error = parseError(err);
    starboardLog.warn(
      `Failed to post starboard message for message ${message.id} to starboard channel ${starboardChannelID}: ${error.message}`,
    );

    captureError(error, {
      messageID: message.id,
      starboardChannelID: starboardChannelID,
    });

    return;
  }
}

/**
 * Edits a starboard message.
 * @param client A Discord.js client instance.
 * @param starboardChannelID The channel ID of the starboard channel.
 * @param starboardMessageID The message ID of the starboard message to edit.
 * @param messageChannelID The message ID of the original message.
 * @param starCount The total number of stars.
 * @returns A boolean indicating success or failure.
 */

async function editStar(
  client: Client<true>,
  starboardChannelID: string,
  starboardMessageID: string,
  starCount: number,
) {
  const channel = await getValidTextChannel(client, starboardChannelID);
  if (!channel) {
    return false;
  }

  try {
    // Gets the message and original embed content.
    const message = await channel.messages.fetch(starboardMessageID);
    const originalEmbed = message.embeds?.[0];
    if (!originalEmbed) {
      starboardLog.debug(`No embed found for message ${starboardMessageID}.`);
      return;
    }

    // Updates the embed.
    const embed = createStarEmbed(message, starCount);
    await message.edit({ embeds: [embed] });

    starboardLog.debug(
      `Updated starboard message ${starboardMessageID} count to ${starCount}.`,
    );

    return true;
  } catch (err) {
    const error = parseError(err);

    // Unknown message; return true to avoid cycling.
    if (error instanceof DiscordAPIError && error.code === 10008) {
      starboardLog.debug(`Starboard message ${starboardMessageID} not found.`);
      return true;
    }

    starboardLog.warn(
      `Failed editing message ${starboardMessageID}: ${error.message}`,
    );

    captureError(error, {
      context: {
        starboardMessageId: starboardMessageID,
        starboardChannelId: starboardMessageID,
        newStarCount: starCount,
      },
    });

    return false;
  }
}

/**
 * Deletes a starboard message.
 * @param client A Discord.js client instance.
 * @param starboardChannelID The starboard channel ID.
 * @param starboardMessageID The message ID of the starboard message to delete.
 * @returns A boolean indicating success or failure.
 */

async function deleteStar(
  client: Client<true>,
  starboardChannelID: string,
  starboardMessageID: string,
) {
  // Gets the starboard channel.
  const channel = await getValidTextChannel(client, starboardChannelID);
  if (!channel) {
    return false;
  }

  try {
    // Fetches the messages and attempts to delete the message.
    const message = await channel.messages.fetch(starboardMessageID);
    await message.delete();
    starboardLog.debug(
      `Deleted starboard message ${starboardMessageID} in channel ${starboardChannelID}.`,
    );

    return true;
  } catch (err) {
    const error = parseError(err);

    // Unknown message handler; likely deleted.
    if (error instanceof DiscordAPIError && error.code === 10008) {
      starboardLog.debug(
        `Starboard message ${starboardMessageID} has already been deleted.`,
      );

      // Return success as the message is already deleted.
      return true;
    }

    starboardLog.error(
      `Failed to delete starboard message ${starboardMessageID} in channel ${starboardChannelID}: ${error.message}`,
    );

    captureError(error, {
      context: {
        starboardMessageId: starboardMessageID,
        starboardChannelId: starboardChannelID,
      },
    });

    return false;
  }
}

/**
 * Handles star reactions being added.
 * @param reaction The reaction to handle.
 * @param user The user who added a star reaction.
 */

export async function handleStarAdd(reaction: MessageReaction, user: User) {
  // Gets the message.
  let message = reaction.message;
  if (message.partial) {
    message = await message.fetch();
  }

  // Do not handle non-star reactions or DMs.
  if (!message.guild || reaction.emoji.name !== STAR_EMOJI) {
    return;
  }

  // Ignore bot and client stars.
  if (!user.bot || reaction.me) {
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
    const starboardMessage = await sendStar(
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
 * @param user The user who removed their reaction.
 */

export async function handleStarRemove(reaction: MessageReaction, user: User) {
  // Gets the message.
  let message = reaction.message;
  if (reaction.partial) {
    message = await message.fetch();
  }

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
