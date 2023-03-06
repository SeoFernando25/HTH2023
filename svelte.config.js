import adapter from "@sveltejs/adapter-cloudflare-workers";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({
    postcss: true,
  }),

  kit: {
    adapter: adapter(),

  },
};

export default config;
