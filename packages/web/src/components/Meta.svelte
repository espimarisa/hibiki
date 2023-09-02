<script lang="ts">
  export let metadata: SvelteMetadata;
</script>

<svelte:head>
  <!-- Title -->
  {#if metadata.title}
    <title>{metadata.title}</title>
    <meta name="title" content={metadata.title} />
    <meta property="og:title" content={metadata.title} />
    <meta property="twitter:title" content={metadata.title} />
  {/if}

  <!-- Description -->
  {#if metadata.description}
    <meta name="description" content={metadata.description} />
    <meta property="og:description" content={metadata.description} />
    <meta property="twitter:description" content={metadata.description} />
  {/if}

  <!-- Image -->
  {#if metadata.image}
    <meta property="og:image" content={metadata.image} />
    <meta property="twitter:image" content={metadata.image} />
  {/if}

  <!-- Image ALT -->
  {#if metadata.imageAlt}
    <meta property="og:image:alt" content={metadata.imageAlt} />
    <meta property="twitter:image:alt" content={metadata.imageAlt} />
  {/if}

  <!-- URL -->
  {#if metadata.url}
    <meta property="og:url" content={metadata.url} />
    <meta property="twitter:url" content={metadata.url} />
  {/if}

  <!-- Type -->
  {#if metadata.type}
    <meta property="og:type" content={metadata.type} />
  {/if}

  <!-- Twitter card -->
  {#if metadata.twitterCard}
    <meta property="twitter:card" content={metadata.twitterCard} />
  {/if}

  <!-- Theme color -->
  {#if metadata.themeColor}
    <meta content={metadata.themeColor} name="theme-color" />
    <meta content={metadata.themeColor} name="msapplication-navbutton-color" />
    <meta content={metadata.themeColor} name="apple-mobile-web-app-status-bar-style" />
  {/if}
</svelte:head>
