<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import { faExclamationTriangle, faHome } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  // Handles signing out
  function handleSignOut() {
    signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }
</script>

<body class="is-fully-centered-body">
  <div>
    <FontAwesomeIcon icon={faExclamationTriangle} size="6x" class="has-text-error" />
  </div>
  <div class="column">
    <h1 class="title">Error</h1>
    <p class="subtitle">Failed to log in.</p>
    <button on:click={handleSignOut}>
      <FontAwesomeIcon icon={faHome} />
      <span>Back to home</span>
    </button>
  </div>
</body>
