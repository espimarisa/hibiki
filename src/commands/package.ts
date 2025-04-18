/**
 * @file Slash command to get package information from various package registries.
 * @author Espi Marisa
 * @license zlib
 */

import type { AURPackage, PartialNPMPackage } from "@/types/endpoints.js";
import {
  AllInteractionContextTypes,
  HibikiColors,
  HibikiImages,
  MessageLimits,
} from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { trimMessage } from "@/utils/format.js";
import { t, tO } from "@/utils/i18n.js";
import { EmbedBuilder, TimestampStyles, time } from "@discordjs/builders";
import { SlashCommandBuilder } from "discord.js";

const aurAPIURL = "https://aur.archlinux.org/rpc/v5/info?arg[]=";
const npmAPIURL = "https://registry.npmjs.com";

export const packageCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("package")
    .setNameLocalizations(tO("commands:PACKAGE_NAME"))
    .setDescription(t("commands:PACKAGE_NAME"))
    .setDescriptionLocalizations(tO("commands:PACKAGE_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes)
    // AUR subcommand
    .addSubcommand((aur) =>
      aur
        .setName("aur")
        .setNameLocalizations(tO("commands:PACKAGE_AUR_NAME"))
        .setDescription(t("commands:PACKAGE_AUR_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:PACKAGE_AUR_DESCRIPTION"))
        // Package argument
        .addStringOption((pkg) =>
          pkg
            .setName("package")
            .setNameLocalizations(tO("commands:PACKAGE_TARGET_NAME"))
            .setDescription(t("commands:PACKAGE_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:PACKAGE_TARGET_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // NPM subcommand
    .addSubcommand((npm) =>
      npm
        .setName("npm")
        .setNameLocalizations(tO("commands:PACKAGE_NPM_NAME"))
        .setDescription(t("commands:PACKAGE_NPM_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:PACKAGE_NPM_DESCRIPTION"))
        // Package argument
        .addStringOption((pkg) =>
          pkg
            .setName("package")
            .setNameLocalizations(tO("commands:PACKAGE_TARGET_NAME"))
            .setDescription(t("commands:PACKAGE_TARGET_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:PACKAGE_TARGET_DESCRIPTION"),
            )
            .setRequired(true),
        )
        // Version argument
        .addStringOption((version) =>
          version
            .setName("version")
            .setNameLocalizations(tO("commands:PACKAGE_VERSION_NAME"))
            .setDescription(t("commands:PACKAGE_VERSION_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:PACKAGE_VERSION_DESCRIPTION"),
            )
            .setRequired(false),
        ),
    ),
  defer: true,

  async runCommand(interaction) {
    // Gets the subcommand, query, and optional version
    const subcommand = interaction.options.getSubcommand(true);
    const query = encodeURIComponent(
      interaction.options.getString("package", true),
    ).toLowerCase();

    // Creates the embed
    const embed = new EmbedBuilder();

    // Gets information for the specific subcommand
    switch (subcommand) {
      /**
       * AUR data
       * @see https://aur.archlinux.org/rpc/v5/info?arg[]=packageName
       */

      case "aur": {
        // Fetches AUR data
        const response = await hFetch(`${aurAPIURL}${query}`);
        if (!response) {
          await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
          return;
        }

        // Converts AUR data to JSON
        const aurBody: AURPackage = await response.json();
        if (!(aurBody?.results?.[0]?.ID && aurBody.results?.[0]?.Name)) {
          await sendErrorReply(interaction, "errors:PACKAGE_QUERY", true, true);
          return;
        }

        // Shorthand for body results
        const body = aurBody.results[0];
        let dependencies: string[][] = [];

        // Submitted on
        if (body.FirstSubmitted) {
          embed.addFields({
            name: t("common:SUBMITTED_ON", { lng: interaction.locale }),
            value: time(
              new Date(body.FirstSubmitted * 1000),
              TimestampStyles.ShortDateTime,
            ),
            inline: false,
          });
        }

        // Modified on
        if (body.LastModified) {
          embed.addFields({
            name: t("common:MODIFIED_ON", { lng: interaction.locale }),
            value: time(
              new Date(body.LastModified * 1000),
              TimestampStyles.ShortDateTime,
            ),
            inline: false,
          });
        }

        // Maintainer
        if (body.Maintainer) {
          embed.addFields({
            name: t("common:MAINTAINERS", {
              count: body.Maintainer.length,
              lng: interaction.locale,
            }),
            value: body.Maintainer,
            inline: true,
          });
        }

        // Upvotes
        if (body.NumVotes) {
          embed.addFields({
            name: t("common:UPVOTES", {
              count: body.NumVotes,
              lng: interaction.locale,
            }),
            value: body.NumVotes.toString(),
            inline: true,
          });
        }

        // License
        if (body.License && body.License.length > 0) {
          embed.addFields({
            name: t("common:LICENSE", { lng: interaction.locale }),
            value: body.License.join(", "),
            inline: true,
          });
        }

        // Provides
        if (body.Provides) {
          embed.addFields({
            name: t("commands:PACKAGE_PROVIDES", { lng: interaction.locale }),
            value: trimMessage(
              body.Provides.map((p) => `\`${p}\``).join(", "),
              MessageLimits.EmbedFieldValue,
            ),
            inline: false,
          });
        }

        // Keywords
        if (body.Keywords && body.Keywords.length > 0) {
          embed.addFields({
            name: t("commands:PACKAGE_KEYWORDS", { lng: interaction.locale }),
            value: trimMessage(
              body.Keywords.map((m) => `\`${m}\``).join(", "),
              MessageLimits.EmbedFieldValue,
            ),
            inline: false,
          });
        }

        // Conflicts
        if (body.Conflicts && body.Conflicts.length > 0) {
          embed.addFields({
            name: t("commands:PACKAGE_CONFLICTS", { lng: interaction.locale }),
            value: trimMessage(
              body.Conflicts.map((m) => `\`${m}\``).join(", "),
              MessageLimits.EmbedFieldValue,
            ),
            inline: false,
          });
        }

        // Checks for dependencies
        if (body.Depends && body.Depends.length > 0) {
          // Append make dependencies if they exist
          if (body.MakeDepends && body.MakeDepends.length > 0) {
            dependencies = [...dependencies, body.MakeDepends];
          } else {
            // Use base dependencies
            dependencies = [...dependencies, body.Depends];
          }

          // Dependencies
          if (dependencies && dependencies.length > 0) {
            embed.addFields({
              name: t("commands:PACKAGE_DEPENDENCIES", {
                lng: interaction.locale,
              }),
              value: trimMessage(
                dependencies.map((m) => `\`${m}\``).join(", "),
                MessageLimits.EmbedFieldValue,
              ),
              inline: false,
            });
          }
        }

        // Notes
        if (body.OutOfDate) {
          embed.addFields({
            name: t("commands:PACKAGE_NOTES", { lng: interaction.locale }),
            value: t("commands:PACKAGE_OUT_OF_DATE", {
              lng: interaction.locale,
            }),
            inline: true,
          });
        }

        // Sets the embed description
        if (body.Description) {
          embed.setDescription(
            trimMessage(body.Description, MessageLimits.EmbedDescription),
          );
        }
        // Sets the embed color
        embed.setColor(HibikiColors.ArchLogo);

        // Sets the embed author
        embed.setAuthor({
          iconURL: HibikiImages.ArchLogo,
          name: `${body.Name} ${body.Version}`,
          url: `https://aur.archlinux.org/packages/${body.Name}`,
        });

        break;
      }

      /**
       * NPM data
       * @see https://registry.npmjs.com/packageName
       */

      case "npm": {
        // Fetches NPM data
        const version = interaction.options.getString("version", false);
        const npmResponse = await hFetch(`${npmAPIURL}/${query}`);
        if (!npmResponse) {
          await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
          return;
        }

        // Converts NPM response to JSON
        const npmBody = await npmResponse.json();
        if (!npmBody?.["dist-tags"]?.latest || npmBody.error) {
          await sendErrorReply(interaction, "errors:PACKAGE_QUERY", true, true);
          return;
        }

        // Gets the individual version data; default to latest
        const body: PartialNPMPackage = version
          ? npmBody.versions[version]
          : npmBody.versions[npmBody["dist-tags"].latest];

        // Error handler; handle specific version errors
        if (!body) {
          await sendErrorReply(
            interaction,
            version !== npmBody["dist-tags"].latest
              ? "errors:PACKAGE_VERSION"
              : "errors:PACKAGE_QUERY",
            true,
            true,
          );

          return;
        }

        // Created on
        embed.addFields({
          name: t("common:CREATED_ON", { lng: interaction.locale }),
          value: time(
            new Date(npmBody.time.created),
            TimestampStyles.ShortDateTime,
          ),
          inline: true,
        });

        // Updated on
        embed.addFields({
          name: t("common:UPDATED_ON", { lng: interaction.locale }),
          value: time(
            new Date(npmBody.time[body.version]),
            TimestampStyles.ShortDateTime,
          ),
          inline: true,
        });

        // Author
        if (body.author) {
          embed.addFields({
            name: t("common:AUTHOR", { lng: interaction.locale }),
            value:
              typeof body.author === "object" ? body.author.name : body.author,
            inline: false,
          });
        }

        // License
        if (body.license) {
          embed.addFields({
            name: t("common:LICENSE", { lng: interaction.locale }),
            value: body.license,
            inline: false,
          });
        }

        // Maintainers
        if (body.maintainers && body.maintainers.length > 0) {
          embed.addFields({
            name: t("common:MAINTAINERS", {
              count: body.maintainers.length,
              lng: interaction.locale,
            }),
            value: trimMessage(
              body.maintainers.map((m) => `\`${m.name}\``).join(", "),
              MessageLimits.EmbedFieldValue,
            ),
            inline: false,
          });
        }

        // Keywords
        if (body.keywords && body.keywords.length > 0) {
          embed.addFields({
            name: t("commands:PACKAGE_KEYWORDS", { lng: interaction.locale }),
            value: trimMessage(
              body.keywords.map((w) => `\`${w}\``).join(", "),
              MessageLimits.EmbedFieldValue,
            ),
            inline: false,
          });
        }

        // Sets the embed description
        if (body.description) {
          embed.setDescription(
            trimMessage(body.description, MessageLimits.EmbedDescription),
          );
        }

        // Sets the embed color
        embed.setColor(HibikiColors.NPMLogo);

        // Sets the embed author
        embed.setAuthor({
          iconURL: HibikiImages.NPMLogo,
          name: body._id,
          url: `https://www.npmjs.com/package/${query}/v/${body.version}`,
        });

        break;
      }

      default: {
        return;
      }
    }
  },
};
