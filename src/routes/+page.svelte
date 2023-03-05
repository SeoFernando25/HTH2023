<script lang="ts">
  import {
    AESencryptBytes,
    generateAESKey,
    publicRSAJsonWebTokenToCryptoKey,
    RSAencryptBytes,
  } from "$lib/browserCrypt";
  import type { UserServerInfo } from "$lib/models/UserInfo";
  import { loggedUser, uploadedFiles } from "$lib/stores";
  import { page } from "$app/stores";
  import { intArrayToNumberArray } from "$lib/util";

  let isUploading = false;

  type SendTypes = "unencrypted" | "private" | "protected" | "transfer";
  let selectedSendType: SendTypes = "unencrypted";
  let encryptionPassword = "";
  let recipientName = "";

  export let uploadStatus: { uri?: string; error?: string } = {};

  const uploadFile = async (file: File, fileName: string) => {
    isUploading = true;

    let fileBuffer = await file.arrayBuffer();
    let encryptedRecipientName = "";
    switch (selectedSendType) {
      case "unencrypted":
        break;
      case "private": {
        if ($loggedUser === null) {
          uploadStatus.error = "You need to log in to upload private files";
          return;
        }
        // Encrypt file with user's AES key

        const aesKey = $loggedUser.aesKey;
        fileBuffer = await AESencryptBytes(
          $loggedUser.password,
          fileBuffer,
          aesKey
        );
        console.log(fileBuffer);
        break;
      }
      case "protected": {
        if (encryptionPassword === "") {
          uploadStatus.error = "You need to provide a password";
          return;
        }

        // Encrypt file with password
        const aesKey = await generateAESKey(
          encryptionPassword,
          encryptionPassword
        );
        fileBuffer = await AESencryptBytes(
          encryptionPassword,
          fileBuffer,
          aesKey
        );
        break;
      }
      case "transfer": {
        if (recipientName === "") {
          uploadStatus.error = "You need to provide a recipient";
          return;
        }

        // Fetch recipient's public key
        const recipient = await fetch(`/users/${recipientName}`);

        if (recipient.status !== 200) {
          uploadStatus.error = "Recipient not found";
          return;
        }

        const recipientInfo: UserServerInfo = await recipient.json();
        const encryptionKey = await publicRSAJsonWebTokenToCryptoKey(
          recipientInfo.publicKey
        );

        const dataArr = new Uint8Array(fileBuffer);
        fileBuffer = await RSAencryptBytes(dataArr, encryptionKey);

        const recipientNameBytes = await RSAencryptBytes(
          new TextEncoder().encode(recipientName),
          encryptionKey
        );
        encryptedRecipientName = new TextDecoder().decode(recipientNameBytes);
        break;
      }
    }

    console.log("uploading file");

    fileBuffer = new Uint8Array(fileBuffer);

    const numArr = intArrayToNumberArray(fileBuffer as Uint8Array);
    const results = await fetch(`/f?name=${fileName}`, {
      method: "POST",
      body: JSON.stringify(numArr),
      //@ts-ignore
      duplex: "half",
    });

    const res = await results.text();
    console.log("file uploaded");
    isUploading = false;
    $uploadedFiles = [...$uploadedFiles, { filename: fileName, uri: res }];
    localStorage.setItem("uploads", JSON.stringify($uploadedFiles));
    const lastFragment = res.split("/").pop();
    if (!lastFragment) {
      uploadStatus.error = "No file id, something went wrong";
      return;
    }
    uploadStatus.uri = $page.url + "file/" + lastFragment;
  };

  const onFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const items = target.files;
    if (!items) {
      uploadStatus.error = "No files";
      return;
    }

    uploadFile(items[0], items[0].name);
  };

  async function dropHandler(event: DragEvent) {
    if (!event.dataTransfer) {
      return;
    }
    const items = event.dataTransfer.items;
    if (items.length === 0) {
      uploadStatus.error = "No files";
      return;
    }

    const droppedFile = items[0].getAsFile();
    if (!droppedFile) {
      uploadStatus.error = "Not a file";
      return;
    }

    uploadFile(droppedFile, droppedFile.name);
  }
</script>

<div class=" flex-1 flex flex-col justify-center items-center">
  <h1 class="text-5xl md:text-6xl lg:text-7xl pb-4">StealthShare</h1>
  <p class="text-xl text-gray-400 pb-4 mb-10">
    Store your files fast, safe and anonymously!
  </p>

  <div class="h-64 w-full md:w-3/4 px-4 flex flex-col items-center gap-4">
    <progress class="progress w-full p-2 {isUploading ? '' : 'hidden'}" />
    {#if uploadStatus?.uri}
      <a
        href={uploadStatus.uri}
        class="alert alert-success shadow-lg rounded-none">{uploadStatus.uri}</a
      >
    {/if}
    {#if uploadStatus?.error}
      <p class="alert alert-error shadow-lg rounded-none">
        A {uploadStatus.error}
      </p>
    {/if}
    <label
      on:drop|preventDefault={dropHandler}
      on:dragover|preventDefault
      for="file"
      class="w-full h-full btn btn-primary rounded-3xl shadow-2xl"
    >
      <h2 class="text-primary-content">
        Drop a file or <span class=" link  link-info cursor-pointer">
          Click
        </span>
      </h2>
    </label>

    <input
      id="file"
      name="file"
      type="file"
      class="hidden"
      on:change={onFileChange}
    />
  </div>
</div>
