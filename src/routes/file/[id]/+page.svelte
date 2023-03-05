<script lang="ts">
  import { page } from "$app/stores";
  import {
    AESdecryptBytes,
    generateAESKey,
    RSAdecryptBytes,
  } from "$lib/browserCrypt";
  import { loggedUser } from "$lib/stores";
  import { downloadData } from "$lib/util";

  let pageId = $page.params.id;
  let origin = $page.url.origin;

  let file: File;
  let decryptionMethod: "ownKey" | "password" = "ownKey";
  let password = "";
  let error = "";

  async function onFileChange(event: Event) {
    const files = event.target as HTMLInputElement;
    if (files.files === null) {
      return;
    }
    file = files.files[0];
    console.log(file);
    let decrypted = await file.arrayBuffer();

    if (decryptionMethod === "ownKey") {
      // Get my private key
      if (!$loggedUser) {
        error = "You need to be logged in to decrypt with your key";
        return;
      }

      decrypted = await AESdecryptBytes(
        $loggedUser?.password,
        decrypted,
        $loggedUser?.aesKey
      );
    } else if (decryptionMethod === "password") {
      // Decrypt with password AWS
      const aesKey = await generateAESKey(password, password);

      try {
        decrypted = await AESdecryptBytes(password, decrypted, aesKey);
      } catch (e) {
        error = "Wrong password";
        return;
      }
    }

    const arr = new Uint8Array(decrypted);
    downloadData(file.name, arr);
  }

  async function decryptWithOwnKey() {
    decryptionMethod = "ownKey";
  }

  async function decryptWithPassword() {
    decryptionMethod = "password";

    if (password === "") {
      error = "You need to provide a password";
      return;
    } else {
      error = "";
    }
  }
</script>

<div class=" flex-1 flex flex-col justify-center items-center">
  <h1 class="text-5xl md:text-6xl lg:text-7xl pb-4 text-center w-full p-4">
    Select a decryption method
  </h1>

  <div class="four-by-four h-[3/4] justify-center w-full md:w-3/4 px-4">
    <a class="btn h-full w-full g1" href="/f/{pageId}"> Just Download </a>
    <div class="g2">
      <!-- As private file -->
      <div
        class="h-full w-full {$loggedUser !== null ? '' : 'tooltip'}"
        data-tip={loggedUser
          ? "You need to be logged in to decrypt with your key"
          : ""}
      >
        <label
          on:click={decryptWithOwnKey}
          on:keydown={void 0}
          for="file"
          class="btn h-full w-full {$loggedUser !== null ? '' : 'btn-disabled'}"
        >
          Decrypt with your own key
        </label>
      </div>
    </div>
    <div class="g3">
      <!-- Decript with password -->
      <div class="h-full flex flex-col gap-2">
        <label
          on:click={decryptWithPassword}
          on:keydown={void 0}
          for="file"
          class="btn flex-1 w-full">Decrypt with password</label
        >
        <input
          bind:value={password}
          type="text"
          placeholder="Decryption password"
          class="input input-bordered w-full"
        />
      </div>
    </div>
    {#if error}
      <p class="alert alert-error shadow-lg w-full g4">
        {error}
      </p>
    {/if}
  </div>
  <!-- Error -->
</div>

<input
  id="file"
  name="file"
  type="file"
  class="hidden"
  on:change={onFileChange}
/>

<style>
  /* 2 by 2 grid */
  .four-by-four {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-gap: 1rem;
  }

  .g1 {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
  }

  .g2 {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }

  .g3 {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }

  .g4 {
    grid-column: 1 / 3;
    grid-row: 3 / 4;
  }
</style>
