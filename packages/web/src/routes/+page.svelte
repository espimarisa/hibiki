<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import { faDiscord } from "@fortawesome/free-brands-svg-icons";
  import { faCat } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  import "../scss/index.scss";
</script>

<Navbar />

<div class="large-hero">
  <span class="title" id="hibiki-title">Hibiki</span>
  <br />
  <span class="subtitle">A Discord bot jam-packed with useful utilities for everyone.</span>
  <br />
  <a href="/invite">
    <button>
      <FontAwesomeIcon icon={faDiscord} />
      <span>Add to Discord</span>
    </button>
  </a>

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
