<script lang="ts">
  // Customizable href
  export let href = "javascript:void(0);";

  // Set to 'false' to disable target=_blank and rel=noopener noreferrer
  export let outbound = false;

  export let target = "";
  export let rel = "";
  export let active = false;

  export let className = "";
  export let idName = "";

  $: if (typeof window !== "undefined") {
    const isExternal = new URL(href, `${location.protocol}//${location.host}`).host !== location.host;
    if (isExternal && outbound === undefined) outbound = true;
  }

  $: if (outbound) {
    target = "_blank";
    if (!rel) rel = "noopener noreferrer";
  }
</script>

<a aria-current={active ? "page" : undefined} {href} {target} {rel} class={className} id={idName}>
  <slot />
</a>
