import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { sendErrorReply } from "$utils/error.ts";
import { hibikiFetch } from "$utils/fetch.ts";
import { t } from "$utils/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";

export class PackageCommand extends HibikiCommand {
  options = [
    {
      // AUR (Arch User Repository)
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: t("commands:COMMAND_PACKAGE_SUBCOMMAND_0_OPTION_0_NAME"),
          description: t("commands:COMMAND_PACKAGE_SUBCOMMAND_0_OPTION_0_DESCRIPTION"),
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      // NPM
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: t("commands:COMMAND_PACKAGE_SUBCOMMAND_1_OPTION_0_NAME"),
          description: t("commands:COMMAND_PACKAGE_SUBCOMMAND_1_OPTION_0_DESCRIPTION"),
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: t("commands:COMMAND_PACKAGE_SUBCOMMAND_1_OPTION_1_NAME"),
          description: t("commands:COMMAND_PACKAGE_SUBCOMMAND_1_OPTION_1_DESCRIPTION"),
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the subcommand specified
    const subcommand = interaction.options.getSubcommand(true);
    const query = interaction.options.getString(this.options[0]!.options[0]!.name);

    // No subcommand error handler
    if (!(subcommand && query)) {
      await sendErrorReply("errors:ERROR_NO_OPTION_PROVIDED", interaction);
      return;
    }

    // Runs the subcommands
    await this.getSubCommandResponse(subcommand, interaction, query);
  }

  async getSubCommandResponse(commandName: string, interaction: ChatInputCommandInteraction, query: string) {
    switch (commandName) {
      // AUR
      case "aur": {
        const API_BASE_URL = "https://aur.archlinux.org";
        const fields: EmbedField[] = [];

        // Gets the initial response
        const response = await hibikiFetch(`${API_BASE_URL}/rpc/v5/info?arg[]=${encodeURIComponent(query)}`);

        // Converts response; handles errors
        const body: AURPackage = await response?.json();
        if (!(response && body?.results?.length && body.results[0].ID && body.results[0].Name)) {
          await sendErrorReply("commands:COMMAND_PACKAGE_NOTFOUND", interaction);
          return;
        }

        // Shorthand for the first package
        const pkg = body.results[0];

        // Trims description
        const pkgDescription =
          pkg.Description && pkg.Description.length > 150
            ? `${pkg.Description?.substring(0, 150)}...`
            : pkg.Description ?? undefined;

        // Maintainer
        if (pkg.Maintainer) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_MAINTAINER", { lng: interaction.locale }),
            value: pkg.Maintainer,
            inline: true,
          });
        }

        // Upvotes
        if (pkg.NumVotes) {
          fields.push({
            name: t("global:UPVOTES", { lng: interaction.locale, count: pkg.NumVotes }),
            value: pkg.NumVotes.toString(),
            inline: true,
          });
        }

        // License
        if (pkg.License?.length) {
          fields.push({
            name: t("global:LICENSE", { lng: interaction.locale }),
            value: pkg.License.join(", "),
            inline: true,
          });
        }

        // Packages provided
        if (pkg.Provides) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_PROVIDES", { lng: interaction.locale }),
            value: `${pkg.Provides.map((m) => `\`${m}\``).join(", ")}`,
            inline: true,
          });
        }

        // Outdated
        if (pkg.OutOfDate) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_OUTOFDATE", { lng: interaction.locale }),
            value: t("booleans:YES", { lng: interaction.locale }),
            inline: true,
          });
        }

        // Dependencies
        let packageDependencies: string[][] = [];
        if (pkg.Depends?.length) {
          packageDependencies = [...packageDependencies, pkg.Depends];
        }

        //  Dependencies + make dependencies
        if (pkg.MakeDepends?.length) {
          packageDependencies = [...packageDependencies, pkg.MakeDepends];
        }

        // Keywords
        if (pkg.Keywords?.length) {
          fields.push({
            name: t("global:KEYWORDS", { lng: interaction.locale, count: pkg.Keywords.length }),
            value: `${pkg.Keywords.map((m) => `\`${m}\``).join(", ")}`,
            inline: false,
          });
        }

        // Keywords
        if (pkg.Conflicts?.length) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_CONFLICTS", { lng: interaction.locale, count: pkg.Conflicts.length }),
            value: `${pkg.Conflicts.map((m) => `\`${m}\``).join(", ")}`,
            inline: false,
          });
        }

        // Dependencies
        if (packageDependencies.length) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_DEPENDENCIES", {
              lng: interaction.locale,
              count: packageDependencies.length,
            }),
            value: `${packageDependencies.map((m) => `\`${m}\``).join(", ")}`,
            inline: false,
          });
        }

        // First submitted
        if (pkg.FirstSubmitted) {
          fields.push({
            name: t("global:SUBMITTED_ON", { lng: interaction.locale }),
            value: createFullTimestamp(new Date(pkg.FirstSubmitted * 1000)),
            inline: false,
          });
        }

        // Last modified
        if (pkg.LastModified) {
          fields.push({
            name: t("global:UPDATED_ON", { lng: interaction.locale }),
            value: createFullTimestamp(new Date(pkg.LastModified * 1000)),
            inline: false,
          });
        }

        // Sends the embed
        await interaction.followUp({
          embeds: [
            {
              description: pkgDescription,
              color: 0x1793d1,
              fields: fields,
              author: {
                url: `https://aur.archlinux.org/packages/${pkg.Name}`,
                icon_url: "https://i.imgur.com/Xl0n1Dk.png",
                name: `${pkg.Name} ${pkg.Version}`,
              },
            },
          ],
        });

        return;
      }

      // NPM
      case "npm": {
        const API_BASE_URL = "https://registry.npmjs.com";
        const fields: EmbedField[] = [];
        const version = interaction.options.getString(this.options[1]!.options[1]!.name, false);

        // Gets the initial response
        const response = await hibikiFetch(`${API_BASE_URL}/${encodeURIComponent(query)}`);

        // Converts response; handles errors
        const body = await response?.json();
        if (!(response || !body?.["dist-tags"]?.latest || body?.error)) {
          await sendErrorReply("commands:COMMAND_PACKAGE_NOTFOUND", interaction);
          return;
        }

        // Specifies what version to search for. Default to latest.
        const pkg: PartialNPMPackage = version ? body.versions[version] : body.versions[body["dist-tags"].latest];

        // Error handler for if the package isn't found or no version is found
        if (!pkg) {
          await sendErrorReply(
            version !== body["dist-tags"].latest
              ? "commands:COMMAND_PACKAGE_NOVERSION"
              : "commands:COMMAND_PACKAGE_NOTFOUND",
            interaction,
          );
          return;
        }

        // Deprecation notice
        if (pkg.deprecated) {
          fields.push({
            name: t("global:NOTICE", { lng: interaction.locale }),
            value: `${pkg.deprecated}`,
            inline: false,
          });
        }

        // Author
        if (pkg.author) {
          fields.push({
            name: t("global:AUTHOR", { lng: interaction.locale }),
            value: typeof pkg.author === "object" ? `${pkg.author.name}` : pkg.author,
            inline: true,
          });
        }

        // License
        if (pkg.license) {
          fields.push({
            name: t("global:LICENSE", { lng: interaction.locale }),
            value: pkg.license,
            inline: true,
          });
        }

        // Maintainers
        if (pkg.maintainers?.length) {
          fields.push({
            name: t("commands:COMMAND_PACKAGE_MAINTAINER", { lng: interaction.locale, count: pkg.maintainers.length }),
            value: pkg.maintainers.map((m) => `\`${m.name}\``).join(", "),
            inline: false,
          });
        }

        // Keywords
        if (pkg.keywords?.length) {
          fields.push({
            name: t("global:KEYWORDS", { lng: interaction.locale, count: pkg.keywords.length }),
            value: pkg.keywords.map((m) => `\`${m}\``).join(", "),
            inline: false,
          });
        }

        // Creation date
        fields.push({
          name: t("global:CREATED_ON", { lng: interaction.locale }),
          value: createFullTimestamp(new Date(body.time.created)),
          inline: false,
        });

        // Version modified on
        fields.push({
          name: t("global:UPDATED_ON"),
          value: createFullTimestamp(new Date(body.time[pkg.version])),
          inline: false,
        });

        await interaction.followUp({
          embeds: [
            {
              description: pkg.description ?? "",
              color: 0xcc3534,
              fields: fields ?? undefined,
              author: {
                name: `${pkg._id}`,
                icon_url: "https://i.imgur.com/KHy3WZ0.png",
                url: `https://www.npmjs.com/package/${query}/v/${pkg.version}`,
              },
            },
          ],
        });

        return;
      }

      default:
        return undefined;
    }
  }
}

// Package data for an individual AUR package
// https://wiki.archlinux.org/title/Aurweb_RPC_interface#1.2.1
interface AURPackage {
  results: [
    {
      ID: number;
      Name: string;
      PackageBaseID?: number;
      PackageBase?: string;
      Version?: string;
      Description?: string;
      URL?: string;
      NumVotes?: number;
      Popularity?: number;
      OutOfDate?: boolean;
      Maintainer?: string;
      FirstSubmitted?: number;
      LastModified?: number;
      URLPath?: string;
      Depends?: string[];
      MakeDepends?: string[];
      OptDepends?: string[];
      CheckDepends?: string[];
      Conflicts?: string[];
      Provides?: string[];
      Replaces?: string[];
      Groups?: string[];
      License?: string[];
      Keywords?: string[];
    },
  ];
}

// Package data for an NPM package
// https://docs.npmjs.com/cli/v10/configuring-npm/package-json#people-fields-author-contributors
interface PartialNPMPackage {
  author?: NPMContact | string;
  config?: Record<string, unknown>;
  cpu?: string[];
  deprecated?: string;
  description?: string;
  files?: string[];
  homepage?: string;
  keywords?: string[];
  license?: string;
  maintainers?: NPMContact[];
  name: string;
  os?: string[];
  version: string;
  _id: string;
}

interface NPMContact {
  email?: string;
  url?: string;
  name: string;
}
