import { loadBlob } from "$lib/server/aws";
import { filesInit, getFile, hasFile } from "$lib/server/files";
import type { RequestHandler } from "@sveltejs/kit";

// filesInit();

export const GET: RequestHandler = (async ({ params }) => {
    const id = params.id;

    if (!id) return new Response("Not found", { status: 404 });

    let file = null;
    try {
        file = await loadBlob(id);
    } catch (error) {
        return new Response(null, { status: 404 });
    }
    const v = file.toString();

    // TODO: Decode the file

    return new Response(v, {
        status: 200,
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + id,
        },
    });
    // const fileName = hasFile(id);
    // if (fileName) {
    //     console.log("Found file");
    //     const file = getFile(fileName);

    //     // Remove the last part of the file name "{actual_filename}_{number}
    //     const actualFileName = fileName.split("_").slice(0, -1).join("_");

    //     return new Response(file, {
    //         status: 200,
    //         headers: {
    //             "Content-Type": "application/octet-stream",
    //             "Content-Disposition": "attachment; filename=" + actualFileName,
    //         },
    //     });
    // }

    // return new Response("Not found", {
    //     status: 404,
    // });
}) satisfies RequestHandler;
