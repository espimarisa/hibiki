<script lang="ts" context="module">
  import { signOut } from "@auth/sveltekit/client";
  import { faArrowLeft, faCircleQuestion, faExclamationTriangle, faHome, faSignOut } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { page } from "$app/stores";

  // Handles signing out
  function handleSignOut() {
    signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }

  // Handles going back
  function handleGoBack() {
    if (window?.history) window.history.back();
    else window.location.href = "/";
  }
</script>

<body class="is-fully-centered">
  {#if $page.data.session}
    <div>
      <FontAwesomeIcon icon={faCircleQuestion} size="6x" class="has-text-warning" />
    </div>
    <div>
      <h1 class="title">Logout</h1>
      <p class="subtitle">Are you sure you want to log out?</p>
      <button on:click={handleGoBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Go back</span>
      </button>
      <button on:click={handleSignOut}>
        <FontAwesomeIcon icon={faSignOut} />
        <span>Logout</span>
      </button>
    </div>
  {:else}
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle} size="6x" class="has-text-error" />
    </div>
    <div class="column">
      <h1 class="title">Error</h1>
      <p class="subtitle">Not signed in.</p>
      <button on:click={handleSignOut}>
        <FontAwesomeIcon icon={faHome} />
        <span>Back to home</span>
      </button>
    </div>
  {/if}
</body>
