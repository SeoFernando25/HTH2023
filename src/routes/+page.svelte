<script lang="ts">
  import { uploadedFiles } from "$lib/stores";

  let isUploading = false;

  export let status: { uri?: string; error?: string } = {};

  const uploadFile = async (file: File) => {
    isUploading = true;
    const results = await fetch(`/f?name=${file.name}`, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      //@ts-ignore
      duplex: "half",
    });

    const res = await results.text();
    isUploading = false;
    $uploadedFiles = [...$uploadedFiles, { filename: file.name, uri: res }];
    localStorage.setItem("uploads", JSON.stringify($uploadedFiles));

    status.uri = res;
  };

  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const items = target.files;
    if (!items) {
      status.error = "No files";
      return;
    }

    uploadFile(items[0]);
  };

  async function dropHandler(event: DragEvent) {
    if (!event.dataTransfer) {
      return;
    }
    const items = event.dataTransfer.items;
    if (items.length === 0) {
      status.error = "No files";
      return;
    }

    const droppedFile = items[0].getAsFile();
    if (!droppedFile) {
      status.error = "Not a file";
      return;
    }

    uploadFile(droppedFile);
  }
</script>

<div class=" flex-1 flex flex-col justify-center items-center">
  <h1 class="text-8xl pb-4">StealthShare</h1>
  <p class="text-xl text-gray-400 pb-4 mb-10">
    Store your files fast, safe and anonymously!
  </p>

  <div class="h-1/3 w-2/3 flex flex-col gap-2">
    <progress class="progress w-full p-2 {isUploading ? '' : 'hidden'}" />
    {#if status?.uri}
      <a href={status.uri} class="alert alert-success shadow-lg rounded-none"
        >{status.uri}</a
      >
    {/if}
    {#if status?.error}
      <p class="alert alert-error shadow-lg rounded-none">A {status.error}</p>
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

<!-- <img class="bottom-art h-1/3" src={image} alt="secret sauce" /> -->
<style>
  .bottom-art {
    /* Centered bottom middle */
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    pointer-events: none;
  }
</style>
