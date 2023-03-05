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
    const info = await createUserLocalInfo("abc", "abc");
    const aesKey = await generateAESKey("abc", "abc");
    const msg = new TextEncoder().encode("secret message");

    const a = await AESencryptBytes(info.username, msg, info.aesKey);

    const aArr = intArrayToNumberArray(a);
    const aBack = numberArrayToIntArray(aArr);

    console.log("equal:", deepEqual(a, aBack));

    const b = await AESdecryptBytes(
      info.username,
      numberArrayToIntArray(aArr),
      aesKey
    );

    const msgVal = new TextDecoder().decode(msg);
    const aVal = new TextDecoder().decode(a);
    const bVal = new TextDecoder().decode(b);
    console.log("msg:", msgVal);
    console.log("a:", aVal);
    console.log("b:", bVal);
    console.log("equal:", deepEqual(a, b));

    const serverInfo = await userInfoToServerInfo(info);

    const strinfy = JSON.stringify(serverInfo);
    const parsed = JSON.parse(strinfy);

    // Verify that parsed is the same as serverInfo
    console.log("equal:", deepEqual(parsed, serverInfo));

    const restored = await serverInfoToUserInfo(parsed, "abc", "abc");

    // Check if we have a "uploads" key in localStorage a json array
    // const uploads = localStorage.getItem("uploads");
    // if (!uploads) {
    //   localStorage.setItem("uploads", JSON.stringify([]));
    // } else {
    //   // If we do, parse it and add it to the uploads array
    //   const parsed: FileEntry[] = JSON.parse(uploads);
    //   uploadedFiles.set(parsed);
    // }
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
