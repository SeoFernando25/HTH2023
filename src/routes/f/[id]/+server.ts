import type { RequestHandler } from "@sveltejs/kit";

import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "fs";

import { createHash } from "crypto";

const dataDir = "./files";
if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
}

const fileNames = readdirSync("./files");

function sha256(data: string) {
    return createHash("sha256").update(data, 'utf8').digest("base64");
}

function smallSha(data: string) {
    return sha256(data).substring(0, 8);
}

const fileHashMap = new Map<string, string>();
fileNames.forEach((fileName) => {
    const fileNameAsHash = smallSha(fileName);
    fileHashMap.set(fileNameAsHash, fileName);
});

export const GET: RequestHandler = (({ params }) => {
    const id = params.id;

    if (!id) return new Response("Not found", { status: 404 });

    const fileName = fileHashMap.get(id);
    if (fileName) {
        console.log("Found file")
        const file = readFileSync("./files/" + fileName);

        // Remove the last part of the file name "{actual_filename}_{number}
        const actualFileName = fileName.split("_").slice(0, -1).join("_");

        return new Response(file, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=" + actualFileName,
            },
        });
    }

    return new Response("Not found", {
        status: 404,
    });
}) satisfies RequestHandler;
