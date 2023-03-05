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
  } from "$lib/browserCrypt";

  onMount(async () => {
    // TODO: Remove this later (currently for testing RSA and AES encryption)
    const txt = "Hello World";
    const original = new TextEncoder().encode(txt);
    const username = "username";
    const password = "password";

    const info = await createUserLocalInfo(username, password);
    const serverInfo = await userInfoToServerInfo(info);

    // console.log(info.publicKey);
    // console.log(serverInfoPubKey);

    // Encrypt with info.publicKey
    const encrypted = await RSAencryptBytes(original, info.publicKey);
    // Decrypt with info.privateKey
    const decrypted = await RSAdecryptBytes(encrypted, info.privateKey);

    console.log("Decrypted: ", new TextDecoder().decode(decrypted));

    // Deserialize serverInfo.publicKey
    const serverInfoPubKey = await publicRSAJsonWebTokenToCryptoKey(
      serverInfo.publicKey
    );
    // Encrypt with serverInfo.privateKey
    // AES unencrypt:
    const serverInfoPrivKeyBuff = await AESdecryptBytes(
      username,
      serverInfo.encryptedPrivateKey,
      info.aesKey
    );

    const serverInfoPrivKey = await arrayBufferToPrivateRSAKey(
      serverInfoPrivKeyBuff
    );

    // Encrypt with serverInfo.publicKey
    const encrypted2 = await RSAencryptBytes(original, serverInfoPubKey);
    // Decrypt with info.privateKey
    const decrypted2 = await RSAdecryptBytes(encrypted2, serverInfoPrivKey);

    console.log("Decrypted2: ", new TextDecoder().decode(decrypted2));

    // console.log(info);
    // console.log(serverInfo);
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
