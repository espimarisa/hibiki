<script lang="ts">
  import Link from "./Link.svelte";
  import { faGithub } from "@fortawesome/free-brands-svg-icons";
  import { faBars, faDonate, faGlobe, faQuestionCircle, faSignIn, faSignOut, faWrench } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { page } from "$app/stores";

  // Navbar styling
  import "../scss/navbar.scss";

  // Navbar functionality
  function toggleNav() {
    const x = document.querySelector("#navbar");
    if (!x?.className) throw new Error("No className to pick");
    if (x.className === "navbar") x.className += " responsive";
    else x.className = "navbar";
  }
</script>

<!-- Navbar for guild picker -->
{#if $page.url.pathname === "/notYetImplemented"}
  <!-- Not yet implemented -->
{:else if $page.url.pathname === "/alsoNotYetImplemented"}
  <!-- Not yet implemented -->
{:else}
  <!-- Index page -->
  <nav class="navbar" id="navbar">
    <Link href="/support" outbound>
      <span>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </span>
      <span>Support</span>
    </Link>

    <Link href="/donate" outbound>
      <span>
        <FontAwesomeIcon icon={faDonate} />
      </span>
      <span>Donate</span>
    </Link>

    <Link href="/github" outbound>
      <span>
        <FontAwesomeIcon icon={faGithub} />
      </span>
      <span>GitHub</span>
    </Link>

    <Link href="/translate" outbound>
      <span>
        <FontAwesomeIcon icon={faGlobe} />
      </span>
      <span>Translate</span>
    </Link>

    <!-- Signed in -->
    {#if $page.data.session?.discordUser}
      <Link href="/auth/logout" className="navbar-right">
        <span>
          <FontAwesomeIcon icon={faSignOut} />
        </span>
        <span>Logout</span>
      </Link>

      <Link href="/dashboard" className="navbar-right">
        <span>
          <FontAwesomeIcon icon={faWrench} />
        </span>
        <span>Dashboard</span>
      </Link>
    {:else}
      <!-- Not signed in -->
      <Link href="/auth/login" className="navbar-right">
        <span>
          <FontAwesomeIcon icon={faSignIn} />
        </span>
        <span>Login with Discord</span>
      </Link>
    {/if}

    <a href="#navbar-toggle" class="navbar-toggle" on:click={toggleNav} aria-label="Toggle navigation">
      <FontAwesomeIcon icon={faBars} />
    </a>
  </nav>
{/if}
