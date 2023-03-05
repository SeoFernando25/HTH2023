<script lang="ts">
  import { tryLogin, tryRegister } from "$lib/auth";
  import { loggedUser } from "$lib/stores";
  let username: string = "";
  let password: string = "";
  let error: string = "";

  /**
   * Loads the user info from the server
   * If 404, creates a new user
   * Otherwise, check if hash matches
   * @param username
   * @param password
   */
  async function tryLoginRegister(username: string, password: string) {
    if (username === "" || password === "") {
      error = "Please enter an username and password";
      return;
    }

    // Try to login
    try {
      const login = await tryLogin(username, password);
      if (login) {
        loggedUser.set(login);
        error = "";
        return;
      }
    } catch (e) {
      console.log(e);
      error = e as string; // Invalid creds
      return;
    }

    // Try to register
    try {
      const user = await tryRegister(username, password);
      loggedUser.set(user);
    } catch (e) {
      console.log(e);
      error = e as string; // Username taken
    }
  }

  function logout() {
    loggedUser.set(null);
  }
</script>

<div class="navbar">
  <a href="/" class="btn btn-ghost">Home</a>
  <a href="/my/uploads" class="btn btn-ghost">Uploads</a>
  <div class="flex-1" />
  <div class="dropdown  dropdown-end">
    {#if $loggedUser === null}
      <div class="flex flex-col">
        <div>
          <input
            tabindex="0"
            bind:value={username}
            id="username"
            type="text"
            placeholder="username"
            class="input input-bordered"
          />
          <input
            type="password"
            bind:value={password}
            placeholder="password"
            class="input input-bordered"
          />
          <button
            class="btn"
            on:click={() => tryLoginRegister(username, password)}
          >
            Login/Register
          </button>
        </div>
        <p class="text-red-500">{error}</p>
      </div>
    {:else}
      <button class="btn btn-ghost" on:click={logout}>Logout</button>
    {/if}
  </div>
</div>
