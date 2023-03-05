
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '$env/static/private';
import AWS, { S3 } from 'aws-sdk';
import type { GetBucketWebsiteRequest, GetObjectAttributesRequest, GetObjectOutput, PutObjectRequest } from 'aws-sdk/clients/s3';
import { smallSha } from './sha';
import { smallRandom } from './uuid';


export const STORAGE_BUCKET_NAME = 'hth-storage-bucket';
export const USER_INFO_BUCKET_NAME = 'hth-user-keys';
process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;


const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export function getUrlFromBucket(fileName: string, s3Bucket: S3 = s3): string | undefined {
    const { config: { params, region, } } = s3Bucket;

    if (!region) {
        return;
    }
    const assetUrl = `https://${STORAGE_BUCKET_NAME}.${s3Bucket.endpoint.host}/${fileName}`
    console.log("Asset url: ", assetUrl);
    return assetUrl;
};

export async function saveBlob(fn: string, blob: Blob): Promise<string> {
    const blobKey = smallRandom();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(buffer.length)
    console.log("Uploading file: ", fn, " to ", blobKey);

    // convert fn to uri encoded
    const encodedFn = encodeURIComponent(fn);

    const uploadParams: PutObjectRequest = {
        Bucket: STORAGE_BUCKET_NAME,
        Key: blobKey, Body: buffer,
        ContentDisposition: `attachment; filename="${encodedFn}"`
    };

    return new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                reject(err);
            } if (data) {
                console.log(data.Location)
                resolve(data.Location);
            }
        });
    });
}

// export async function loadBlob(blobId: string): void {
//     const url = getUrlFromBucket(s3, blobId) ?? "";
//     console.log("Loading blob: ", blobId, " from ", url);
// };


export async function getAllFilenames(): Promise<string[]> {
    const params = { Bucket: STORAGE_BUCKET_NAME };
    return new Promise((resolve, reject) => {
        s3.listObjects(params, function (err, data) {
            if (err) {
                reject(err);
            } if (data) {
                if (!data.Contents) {
                    reject("No contents");
                } else {
                    resolve(data.Contents.map(c => c.Key ?? ""));
                }
            }
        });
    });
}