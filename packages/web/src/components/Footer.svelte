<script lang="ts">
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { faHeart } from "@fortawesome/free-solid-svg-icons";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
import { onMount } from "svelte";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import { _ as t } from "svelte-i18n";
// biome-ignore lint/correctness/noUnusedImports: This is used. BiomeJS bug.
import Link from "./Link.svelte";

// biome-ignore lint/correctness/noUnusedVariables: This is used. BiomeJS bug.
const date = new Date().getFullYear();

onMount(() => {
  // Silly little easter egg
  const cuteElement = document.querySelector("#readIfCute");
  if (cuteElement) {
    cuteElement.addEventListener("click", () => {
      cuteElement.textContent = "read if cute :3";
    });
  }
});
</script>

<footer>
  <p id="readIfCute"><FontAwesomeIcon icon={faHeart} /></p>
  <p>&copy {date} Espi Marisa.</p>
  <p>
    {$t("FOOTER_OPEN_SOURCE")} <Link href="/license" outbound>{$t("FOOTER_LICENSE")}</Link>.
  </p>
</footer>
