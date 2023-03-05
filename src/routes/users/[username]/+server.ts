import type { UserServerInfo } from "$lib/models/UserInfo";
import { addUserKeys, getUserKeys } from "$lib/server/aws";
import type { RequestHandler } from "@sveltejs/kit";

export const GET = (async ({ params }) => {
    if (!params.username) return new Response("Not found", { status: 404 });
    let userInfo: UserServerInfo;
    try {
        userInfo = await getUserKeys(params.username);
    } catch (error) {
        return new Response("Not found", { status: 404 });
    }

    return new Response(JSON.stringify(userInfo), { status: 200 });
}) satisfies RequestHandler;


export const POST = (async ({ request, params }) => {
    try {
        const userInfo = await getUserKeys(params.username ?? '');
        return new Response("User already exists", { status: 409 });
    } catch (error) {
        //If user does not exist, we are good to go
    }


    let userInfo: UserServerInfo;
    try {
        userInfo = await request.json() satisfies UserServerInfo;
        // TODO: Schema validation
    } catch (error) {
        console.log(error);
        return new Response("Bad request", { status: 400 });
    }

    try {
        const r = await addUserKeys(params?.username ?? '', userInfo);
    } catch (error) {
        console.log(error);
        return new Response("Bad request", { status: 400 });
    }
    return new Response("OK", { status: 200 });
}) satisfies RequestHandler;