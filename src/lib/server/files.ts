import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "fs";
import { smallSha } from "./sha";

const dataDir = "./files";

export function filesInit() {
    if (!existsSync(dataDir)) {
        mkdirSync(dataDir);
    }
}

export function hasFile(hash: string): string | undefined {

    const fileNames = readdirSync("./files");
    console.log(fileNames)
    for (const fileName of fileNames) {
        console.log(fileName)
        console.log(smallSha(fileName))
        console.log()
        if (smallSha(fileName) === hash.trim()) {
            return fileName;
        }
    }
}

export function getFile(fileName: string) {
    const file = readFileSync("./files/" + fileName);
    return file;
}


export async function saveBlob(fn: string, blob: Blob) {
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
