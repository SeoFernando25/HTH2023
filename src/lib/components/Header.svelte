<div class="navbar">
  <a href="/" class="btn btn-ghost">Home</a>
  <a href="/my/uploads" class="btn btn-ghost">Uploads</a>
  <div class="flex-1" />
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
