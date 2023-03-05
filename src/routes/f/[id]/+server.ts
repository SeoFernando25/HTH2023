import { getUrlFromBucket } from "$lib/server/aws";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = (async ({ params }) => {
    const id = params.id;

    if (!id) return new Response("Not found", { status: 404 });


    const url = getUrlFromBucket(id);
    console.log("URL: ", url);
    if (url) {
        const redirectCode = 302;
        throw redirect(redirectCode, url);
    }

    return new Response("Not found", { status: 404 });
}) satisfies RequestHandler;
