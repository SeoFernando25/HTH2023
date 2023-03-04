import { getAllFilenames, saveBlob } from "$lib/server/aws";
import type { RequestHandler } from "@sveltejs/kit";

// filesInit();

function smallRandom() {
    return Math.random().toString(36).substring(2, 15);
}

export const POST = (async ({ request, url }) => {
    console.log("Uploading something....")
    const blob = await request.blob();
    const sizeInKb = blob.size / 1024;
    const filename = url.searchParams.get("name") ?? smallRandom();
    const uri = await saveBlob(filename, blob);
    return new Response(uri);
}) satisfies RequestHandler;