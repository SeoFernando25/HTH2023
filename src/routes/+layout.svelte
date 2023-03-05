<script lang="ts">
  import { onMount } from "svelte";
  import { uploadedFiles, type FileEntry } from "$lib/stores";
  import Header from "$lib/components/Header.svelte";
  import {
    decryptBytes,
    encryptBytes,
    generateAESKey,
    generateRSAKey,
  } from "$lib/browserCrypt";

  onMount(async () => {
    // TODO: Remove this later (currently for testing RSA and AES encryption)
    const txt = "Hello World";
    const original = new TextEncoder().encode(txt);
    const username = "username";
    const password = "password";

    const key = await generateAESKey(username, password);
    const rsa = await generateRSAKey();
    const rsaPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      rsa.privateKey
    );

    console.log("EXPORT:", rsaPrivateKey);
    // const encrypted_private_key = await encryptBytes(
    //   "private_key",
    //   rsa.privateKey,
    //   key
    // );

    // Encrypt
    const encrypted = await encryptBytes(txt, original, key);
    console.log(new TextDecoder().decode(encrypted));

    // Decrypt
    const decrypted = await decryptBytes(txt, encrypted, key);
    console.log(new TextDecoder().decode(decrypted));

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
