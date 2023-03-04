import { saveBlob } from "$lib/server/aws";
import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
    login: async (event) => {
        //
    },

    upload: async (event) => {
        const formData = await event.request.formData();
        const fileEntry = formData.get("file");
        console.log("File entry: ", fileEntry)
        if (!(fileEntry instanceof Blob)) {
            return {
                status: 400,
                error: "No file",
            };
        }

        const MAX_SIZE_MB = 100;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1000000;
        if (fileEntry.size > MAX_SIZE_BYTES) {
            return {
                status: 400,
                error: "File too large",
            };
        }
        if (fileEntry.size < 1) {
            return {
                status: 400,
                error: "No file",
            };
        }

        const filename = fileEntry.name;
        console.log("Uploading file: ", filename);
        const uri = await saveBlob(filename, fileEntry);

        const lastSegment = uri.split("/").pop();

        if (!lastSegment) {
            return {
                status: 500,
                error: "Error uploading file",
            };
        }

        const accessUrl = `${event.url.origin}/f/${lastSegment}`
        console.log("Uploaded to: ", accessUrl)



        return {
            status: 200,
            uri: accessUrl,
        };
    }
};