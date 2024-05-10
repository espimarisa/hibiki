<script lang="ts">
import { HibikiWebURL } from "$shared/constants.ts";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { _ as t } from "svelte-i18n";
import type { SvelteMetadata } from "../app";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Footer from "../components/Footer.svelte";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Link from "../components/Link.svelte";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Metadata from "../components/Metadata.svelte";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Navbar from "../components/Navbar.svelte";

import "../scss/index.scss";

// Page metadata
// biome-ignore lint/correctness/noUnusedVariables: This import is used. BiomeJS bug
const metadata = {
  // biome-ignore lint/correctness/noUndeclaredVariables: This exists. BiomeJS bug.
  title: $t("HIBIKI"),
  // biome-ignore lint/correctness/noUndeclaredVariables: This exists. BiomeJS bug.
  description: $t("HIBIKI_DESCRIPTION"),
  url: process.env.NODE_ENV === "production" ? HibikiWebURL : "",
  themeColor: "#FFB000",
} satisfies SvelteMetadata;
</script>

<Metadata {metadata} />

<Navbar />

<div class="large-hero">
  <p class="title" id="hibiki-title">{$t("HIBIKI")}</p>
  <p class="subtitle">{$t("HIBIKI_DESCRIPTION")}</p>

  <Link href="/invite" outbound>
    <button>
      <FontAwesomeIcon icon={faDiscord} />
      <span>{$t("ADD_TO_DISCORD")}</span>
    </button>
  </Link>

  <br />
</div>

<Footer />
