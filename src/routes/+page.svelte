<script lang="ts">
  import image from "$lib/assets/secret_sauce.png";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { ActionData } from "./$types";
  import { tick } from "svelte";

  let files: File | undefined;
  let uploadForm: HTMLFormElement;
  export let form: ActionData;

  const onFileChange = (event: Event) => {
    console.log(event);
  };

  async function dropHandler(event: DragEvent) {
    if (!event.dataTransfer) {
      return;
    }
    const items = event.dataTransfer.items;
    if (!items) {
      return;
    }

    const droppedFile = items[0].getAsFile();
    if (!droppedFile) {
      return;
    }

    // Call f/ post endpoint, body is the file itself
    // and pass name as query param

    console.log(droppedFile);

    const results = await fetch(`/f?name=${droppedFile.name}`, {
      method: "POST",
      body: droppedFile,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      //@ts-ignore
      duplex: "half",
    });

    const res = await results.text();

    form = {
      uri: res,
      status: results.status,
    };
  }

  function dragOverHandler(params: any) {
    console.log("Drag over");
  }
</script>

<div class="navbar">
  <div class="dropdown  dropdown-end">
    <form class="p-2 flex flex-row gap-2" action="?/login">
      <!-- TODO Auth stuff -->
      <input
        tabindex="0"
        id="username"
        type="text"
        placeholder="username"
        class="input input-bordered"
      />
      <input
        type="password"
        placeholder="password"
        class="input input-bordered"
      />
      <button type="submit" class="btn">Login</button>
    </form>
  </div>
</div>

<div class=" flex-1 flex flex-col justify-center items-center">
  <h1 class="text-8xl pb-4">File Phantom</h1>
  <p class="text-xl text-gray-400 pb-4 mb-10">
    Store your files fast, safe and anonymously!
  </p>

  <form
    method="POST"
    class="h-1/3 w-2/3 flex flex-col gap-2"
    action="?/upload"
    enctype="multipart/form-data"
    bind:this={uploadForm}
  >
    {#if form?.uri}
      <a href={form.uri} class="alert alert-success shadow-lg rounded-none"
        >{form.uri}</a
      >
    {/if}
    {#if form?.error}
      <p class="alert alert-error shadow-lg rounded-none">A {form.error}</p>
    {/if}
    <label
      on:drop|preventDefault={dropHandler}
      on:dragover|preventDefault={dragOverHandler}
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
      bind:files
      id="file"
      name="file"
      type="file"
      class="hidden"
      on:change={onFileChange}
    />

    <!-- {#if file} -->
    <input type="submit" class="btn w-full btn-primary" value="Submit" />
    <!-- {/if} -->
  </form>
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
