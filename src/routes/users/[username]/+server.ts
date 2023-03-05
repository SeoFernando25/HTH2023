import type { UserServerInfo } from "$lib/models/UserInfo";
import { getUserKeys } from "$lib/server/aws";
import type { RequestHandler } from "@sveltejs/kit";

export const GET = (async ({ params }) => {
    if (!params.username) return new Response("Not found", { status: 404 });
    const userInfo = await getUserKeys(params.username);

    console.log("User info: ", userInfo);

    return new Response("Not found", { status: 404 });
}) satisfies RequestHandler;


export const POST = (async ({ request, url }) => {
    // TODO: Verify that the username is not already taken
    let userInfo: UserServerInfo;
    try {
        userInfo = await request.json() satisfies UserServerInfo;
        // TODO: Schema validation
    } catch (error) {
        return new Response("Bad request", { status: 400 });
    }
    console.log("got user info: ", userInfo);
    return new Response("Not found", { status: 404 });
}) satisfies RequestHandler;