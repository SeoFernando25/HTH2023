import { getUrlFromBucket } from "$lib/server/aws";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = (async ({ params, url }) => {
    const id = params.id;

    const noredirect = url.searchParams.get("noredirect") === "true";

    console.log("no redirect: ", noredirect);

    if (!id) return new Response("Not found", { status: 404 });


    const bucketUrl = getUrlFromBucket(id);
    console.log("URL: ", bucketUrl);
    if (bucketUrl) {
        const redirectCode = 302;
        console.log("Redirecting to: ", bucketUrl);
        if (noredirect) {
            return new Response(bucketUrl, { status: redirectCode });
        }
        throw redirect(redirectCode, bucketUrl);
    }

    return new Response("Not found", { status: 404 });
}) satisfies RequestHandler;
