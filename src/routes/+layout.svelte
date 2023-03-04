<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
</script>

<slot />

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
