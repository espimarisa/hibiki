<script lang="ts">
// Customizable href
// biome-ignore lint/style/useConst: Svelte let export
export let href = "javascript:void(0);";

// Set to 'false' to disable target=_blank and rel=noopener noreferrer
export let outbound = false;

export let target = "";
export let rel = "";
// biome-ignore lint/style/useConst: Svelte let export
export let active = false;

// biome-ignore lint/style/useConst: Svelte let export
export let className = "";
// biome-ignore lint/style/useConst: Svelte let export
export let idName = "";

if (typeof window !== "undefined") {
  const isExternal = new URL(href, `${location.protocol}//${location.host}`).host !== location.host;
  if (isExternal && outbound === undefined) {
    outbound = true;
  }
}

if (outbound) {
  target = "_blank";
  if (!rel) {
    rel = "noopener noreferrer";
  }
}
</script>

<a aria-current={active ? "page" : undefined} {href} {target} {rel} class={className} id={idName}>
  <slot />
</a>
