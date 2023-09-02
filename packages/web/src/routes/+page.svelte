<script lang="ts">
  import type { SvelteMetadata } from "../typings/index.js";
  import Footer from "../components/Footer.svelte";
  import Link from "../components/Link.svelte";
  import Meta from "../components/Meta.svelte";
  import Navbar from "../components/Navbar.svelte";
  import { faDiscord } from "@fortawesome/free-brands-svg-icons";
  import { faCat } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import "../scss/index.scss";

  // Page metadata
  const metadata = {
    title: "Hibiki",
    description: "A Discord bot jam-packed with useful utilities for everyone!",

    // TODO: Add this to shared/constants
    themeColor: "FFB000",

    // TODO: Implement URL
    url: "",
  } satisfies SvelteMetadata;
</script>

<Meta {metadata} />

<Navbar />

<div class="large-hero">
  <p class="title" id="hibiki-title">Hibiki</p>
  <p class="subtitle">A Discord bot jam-packed with useful utilities for everyone.</p>

  <Link href="/invite" outbound>
    <button>
      <FontAwesomeIcon icon={faDiscord} />
      <span>Add to Discord</span>
    </button>
  </Link>

  <br />
</div>

<div class="small-hero">
  <div class="grid">
    <div class="tile is-centered">
      <FontAwesomeIcon icon={faCat} size="3x" class="tile-icon" />
      <p>TODO: Add things</p>
    </div>

    <div class="tile is-centered">
      <FontAwesomeIcon icon={faCat} size="3x" class="tile-icon" />
      <p>TODO: Add things</p>
    </div>

    <div class="tile is-centered">
      <FontAwesomeIcon icon={faCat} size="3x" class="tile-icon" />
      <p>TODO: Add things</p>
    </div>
  </div>
</div>

<Footer />
