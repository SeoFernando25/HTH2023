import { saveBlob } from "$lib/server/aws";
import { numberArrayToIntArray } from "$lib/util";
import type { RequestHandler } from "@sveltejs/kit";

function smallRandom() {
    return Math.random().toString(36).substring(2, 15);
}

export const POST = (async ({ request, url }) => {
    console.log("Uploading something....")
    const numberArr = await request.json();
    const blob = numberArrayToIntArray(numberArr);
    console.log("Blob: ", blob)
    const filename = url.searchParams.get("name") ?? smallRandom();
    const uri = await saveBlob(filename, blob);

    return new Response(uri);
}) satisfies RequestHandler;