<script lang="ts">
  import { onMount } from "svelte";
  import { uploadedFiles, type FileEntry } from "$lib/stores";
  import Header from "$lib/components/Header.svelte";
  import {
    createUserLocalInfo,
    userInfoToServerInfo,
    AESdecryptBytes,
    AESencryptBytes,
    generateAESKey,
    generateRSAKey,
    publicRSAJsonWebTokenToCryptoKey,
    SHADigest,
    RSAencryptBytes,
    RSAdecryptBytes,
    arrayBufferToPrivateRSAKey,
    serverInfoToUserInfo,
  } from "$lib/browserCrypt";

  onMount(async () => {
    // TODO: Remove this later (currently for testing RSA and AES encryption)
    const username = "username";
    const password = "password";

    const info = await createUserLocalInfo(username, password);
    const serverInfo = await userInfoToServerInfo(info);

    // call /users/{username} endpoint to post/create user
    const response = await fetch(`/users/${username}`, {
      method: "POST",
      body: JSON.stringify(serverInfo),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // call /users/{username} endpoint to get user
    const serverInfoResponse = await fetch(`/users/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverInfoDeserialized = await serverInfoResponse.json();

    console.log("serverInfo", serverInfoDeserialized);

    console.log("response", response);

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
