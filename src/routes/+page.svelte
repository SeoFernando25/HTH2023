<script>
  import image from "$lib/assets/secret_sauce.png";
</script>

<div class=" flex flex-col justify-center items-center h-screen">
  <h1 class="  mt-4 text-8xl pb-4">File Phantom</h1>
  <p class="text-xl text-gray-400 pb-4 mb-10">
    Store your files fast, safe and anonymously!
  </p>

  <button class="btn btn-primary h-1/3 w-2/3 rounded-3xl shadow-2xl ">
    <h2 class="text-primary-content">
      Drop a file or <span class=" text-blue-600 cursor-pointer"> Click </span>
    </h2>
  </button>
</div>

<img class="bottom-art h-1/3" src={image} alt="secret sauce" />

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
