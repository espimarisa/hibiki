<script lang="ts">
  import { faExclamationTriangle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { page } from "$app/stores";

  // Handles going back
  function handleGoBack() {
    if (window?.history) window.history.back();
    else window.location.href = "/";
  }
</script>

<body class="is-fully-centered-body">
  <div>
    <FontAwesomeIcon icon={faExclamationTriangle} size="6x" class="has-text-error" />
  </div>
  <div>
    <h1 class="title">{$page.status}</h1>
    <p class="subtitle">{$page.error?.message}</p>
    <button on:click={handleGoBack}>
      <FontAwesomeIcon icon={faArrowLeft} />
      <span>Go back</span>
    </button>
  </div>
</body>
