<script lang="ts">
  import { faGithub } from "@fortawesome/free-brands-svg-icons";
  import { faBars, faDonate, faGlobe, faQuestionCircle, faSignIn } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

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

<div class="navbar" id="navbar">
  <a href="/support">
    <span>
      <FontAwesomeIcon icon={faQuestionCircle} />
    </span>
    <span>Support</span>
  </a>

  <a href="/donate">
    <span>
      <FontAwesomeIcon icon={faDonate} />
    </span>
    <span>Donate</span>
  </a>

  <a href="/github">
    <span>
      <FontAwesomeIcon icon={faGithub} />
    </span>
    <span>GitHub</span>
  </a>

  <a href="/translate">
    <span>
      <FontAwesomeIcon icon={faGlobe} />
    </span>
    <span>Translate</span>
  </a>

  <a href="/dashboard" class="navbar-right">
    <span>
      <FontAwesomeIcon icon={faSignIn} />
    </span>
    <span>Login with Discord</span>
  </a>

  <a href="#navbar-toggle" class="navbar-toggle" on:click={toggleNav}>
    <FontAwesomeIcon icon={faBars} />
  </a>
</div>
