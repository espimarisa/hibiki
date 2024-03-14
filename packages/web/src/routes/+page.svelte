<script lang="ts">
  import Meta from "../components/Meta.svelte";
  import "../scss/index.scss";

  // Page metadata
  const metadata = {
    title: "Title",
    description: "Description",
    themeColor: "#FFB000",
    url: "",
  } satisfies SvelteMetadata;
</script>

<Meta {metadata} />

<p>hewwo</p>
