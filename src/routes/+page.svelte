<script>
  import image from "$lib/assets/secret_sauce.png";
</script>

<div class=" flex flex-col justify-center items-center h-screen">
  <h1 class=" text-center mt-4 text-8xl text-white pb-4">File Phantom</h1>
  <p class="text-xl text-gray-400 text-center pb-4 mb-10">
    Store your files fast, safe and anonymously!
  </p>

  <button
    class="btn drop__container flex flex-col justify-center h-1/3 w-2/3 bg-white hover:bg-slate-200 rounded-3xl shadow-2xl "
  >
    <h2 class="text-center cursor-default">
      Drop a file or <span class=" text-blue-600 cursor-pointer"> Click </span>
    </h2>
  </button>

  <img class="h-1/3" src={image} alt="secret sauce" />
</div>
