<script lang="ts">
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import {
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faBars,
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faDonate,
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faFileContract,
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faGlobe,
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faQuestionCircle,
  // biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { _ as t } from "svelte-i18n";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Link from "./Link.svelte";

// Navbar styling
import "../scss/navbar.scss";

// Navbar functionality
// biome-ignore lint/correctness/noUnusedVariables: This is used. BiomeJS bug.
function toggleNav() {
  const x = document.querySelector("#navbar");
  if (!x?.className) {
    throw new Error("No className to pick");
  }

  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}
</script>

<nav class="navbar" id="navbar">
  <Link href="/support" outbound>
    <span>
      <FontAwesomeIcon icon={faQuestionCircle} />
    </span>
    <span>{$t("SUPPORT")}</span>
  </Link>

  <Link href="/donate" outbound>
    <span>
       <FontAwesomeIcon icon={faDonate} />
    </span>
    <span>{$t("DONATE")}</span>
  </Link>

  <Link href="/github" outbound>
    <span>
      <FontAwesomeIcon icon={faGithub} />
    </span>
    <span>{$t("GITHUB")}</span>
   </Link>

  <Link href="/translate" outbound>
    <span>
      <FontAwesomeIcon icon={faGlobe} />
    </span>
    <span>{$t("TRANSLATE")}</span>
  </Link>

  <Link href="/terms" outbound className="navbar-right">
    <span>
      <FontAwesomeIcon icon={faFileContract} />
    </span>
    <span>{$t("TERMS_OF_SERVICE")}</span>
  </Link>

  <Link href="/privacy" outbound className="navbar-right">
    <span>
      <FontAwesomeIcon icon={faShieldAlt} />
    </span>
    <span>{$t("PRIVACY_POLICY")}</span>
  </Link>

  <a href="#navbar-toggle" class="navbar-toggle" on:click={toggleNav} aria-label="Toggle navigation">
    <FontAwesomeIcon icon={faBars} />
  </a>
</nav>
