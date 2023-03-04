import type { RequestHandler } from "@sveltejs/kit";

import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "fs";

import { createHash } from "crypto";

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


const dataDir = "./files";
if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
}



function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

async function saveBlob(fn: string, blob: Blob) {
    // Find all files that start with the same name
    const files = readdirSync(dataDir);
    const matchingFiles = files.filter((f) => f.startsWith(fn));
    console.log("Found " + matchingFiles.length + " matching files");
    console.log(matchingFiles);

    // Get all `fn_{number}` and find the highest number
    const numbers = matchingFiles
        .map((f) => f.split("_")[1])
        .map((n) => parseInt(n))
    const highestNumber = numbers.reduce((a, b) => Math.max(a, b), 0);
    console.log("Highest number is " + highestNumber);

    // Save the file as `fn_{highestNumber + 1}`
    const newFilename = fn + "_" + (highestNumber + 1);
    console.log("Saving file as " + newFilename);

    // Save the blob on the files folder
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(dataDir + "/" + newFilename, buffer);

    const uri = smallSha(newFilename);
    return uri;
}


export const POST = (async ({ request, url }) => {
    console.log("Uploading something....")
    const blob = await request.blob();
    const sizeInKb = blob.size / 1024;
    console.log("Uploaded " + sizeInKb + "kb")
    const filename = url.searchParams.get("name") ?? uuidv4();
    const uri = await saveBlob(filename, blob);
    fileHashMap.set(uri, filename);
    return new Response(uri);
}) satisfies RequestHandler;