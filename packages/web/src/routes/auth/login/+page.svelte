<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { faDiscord } from "@fortawesome/free-brands-svg-icons";
  import { faArrowLeft, faCheckCircle, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { page } from "$app/stores";

  // Signs into Discord
  function handleLogIn() {
    signIn("discord", {
      callbackUrl: "/dashboard",
      redirect: true,
    });
  }

  // Handles going back
  function handleGoBack() {
    if (window?.history) window.history.back();
    else window.location.href = "/";
  }
</script>

<body class="is-fully-centered-body">
  {#if $page.data.session}
    <div>
      <FontAwesomeIcon icon={faCircleQuestion} size="6x" class="has-text-warning" />
    </div>
    <div>
      <h1 class="title">Login</h1>
      <p class="subtitle">Are you sure you want to refresh your login?</p>
      <button on:click={handleGoBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Go back</span>
      </button>
      <button on:click={handleLogIn}>
        <FontAwesomeIcon icon={faDiscord} />
        <span>Login with Discord</span>
      </button>
    </div>
  {:else}
    <div>
      <FontAwesomeIcon icon={faCheckCircle} size="6x" class="has-text-primary" />
    </div>
    <div class="column">
      <h1 class="title">Login</h1>
      <p class="subtitle">Please continue with Discord.</p>
      <button on:click={handleGoBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Go back</span>
      </button>
      <button on:click={handleLogIn}>
        <FontAwesomeIcon icon={faDiscord} />
        <span>Login with Discord</span>
      </button>
    </div>
  {/if}
</body>
