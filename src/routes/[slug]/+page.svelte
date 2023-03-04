<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  // import page store

  export let data: PageData;

  onMount(() => {
    console.log(data);
  });
</script>

<h1>{$page.params.slug}</h1>
