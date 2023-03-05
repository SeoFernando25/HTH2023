import type { RequestHandler } from "@sveltejs/kit";

export const GET = (async ({ params }) => {
    // FETCHES an usernames public key and encrypted private key

    return new Response("Not found", { status: 404 });
}) satisfies RequestHandler;
