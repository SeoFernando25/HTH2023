<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
</script>

<div class="h-screen flex flex-col">
  <slot />
</div>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
