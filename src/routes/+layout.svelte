<script lang="ts">
  import { onMount } from "svelte";
  import { uploadedFiles, type FileEntry } from "$lib/stores";
  import Header from "$lib/components/Header.svelte";
  import {
    AESdecryptBytes,
    AESencryptBytes,
    createUserLocalInfo,
    generateAESKey,
    serverInfoToUserInfo,
    userInfoToServerInfo,
  } from "$lib/browserCrypt";
  import {
    deepEqual,
    intArrayToNumberArray,
    numberArrayToIntArray,
  } from "$lib/util";

  onMount(async () => {
    // Check if we have a "uploads" key in localStorage a json array
    const uploads = localStorage.getItem("uploads");
    if (!uploads) {
      localStorage.setItem("uploads", JSON.stringify([]));
    } else {
      // If we do, parse it and add it to the uploads array
      const parsed: FileEntry[] = JSON.parse(uploads);
      uploadedFiles.set(parsed);
    }
  });
</script>

<div class="h-screen flex flex-col">
  <Header />
  <slot />
</div>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
