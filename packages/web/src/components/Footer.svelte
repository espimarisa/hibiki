<script lang="ts">
  import { faHeart } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { onMount } from "svelte";
  import Link from "./Link.svelte";

  const date = new Date().getFullYear();

  onMount(() => {
    // Silly little easter egg
    const cuteElement = document.getElementById("readIfCute");
    if (cuteElement) {
      cuteElement.addEventListener("click", () => {
        cuteElement.textContent = "read if cute :3";
      });
    }
  });
</script>

<footer>
  <p id="readIfCute"><FontAwesomeIcon icon={faHeart} style="color: red;" /></p>
  <p>&copy {date} Espi Marisa and contributors.</p>
  <p>
    Open-source under the <Link href="/license" outbound>zlib/libpng license</Link>.
  </p>
</footer>
