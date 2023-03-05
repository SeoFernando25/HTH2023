
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '$env/static/private';
import AWS, { S3 } from 'aws-sdk';
import type { DeleteObjectRequest, GetBucketWebsiteRequest, GetObjectAttributesRequest, GetObjectOutput, GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { smallRandom } from './uuid';
import { userServerInfoSchema, type UserServerInfo } from '$lib/models/UserInfo';


export const STORAGE_BUCKET_NAME = 'hth-storage-bucket';
export const USER_INFO_BUCKET_NAME = 'hth-user-keys';
process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;


const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export function getUrlFromBucket(fileName: string, s3Bucket: S3 = s3, bucket = STORAGE_BUCKET_NAME): string | undefined {
    const { config: { region, } } = s3Bucket;

    if (!region) {
        return;
    }
    const assetUrl = `https://${bucket}.${s3Bucket.endpoint.host}/${fileName}`
    console.log("Asset url: ", assetUrl);
    return assetUrl;
};

export async function saveBlob(fn: string, blob: Blob, extraHeaders: { [key: string]: string } = {}): Promise<string> {
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
        ContentDisposition: `attachment; filename="${encodedFn}"`,
    };

    return new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                reject(err);
            }
            console.log(data.Location)
            resolve(data.Location);

        });
    });
}

export async function getAllFilenames(): Promise<string[]> {
    const params = { Bucket: STORAGE_BUCKET_NAME };
    return new Promise((resolve, reject) => {
        s3.listObjects(params, function (err, data) {
            if (err) {
                reject(err);
            }
            if (!data.Contents) {
                return reject("No contents");
            }
            resolve(data.Contents.map(c => c.Key ?? ""));
        });
    });
}

export async function addUserKeys(username: string, info: UserServerInfo): Promise<string> {

    try {
        await getUserKeys(username);
        return new Promise((resolve, reject) => {
            reject("User already exists");
        });
    } catch (error) {
        // If user does not exist, we are good to go
    }

    const uploadParams: PutObjectRequest = {
        Bucket: USER_INFO_BUCKET_NAME,
        Key: username,
        Body: JSON.stringify(info)
    };
    return new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data.Location);
        });
    });
}

export function getUserKeysUrl(username: string): string | undefined {
    return getUrlFromBucket(username, s3, USER_INFO_BUCKET_NAME);
}

export async function getUserKeys(username: string): Promise<UserServerInfo> {
    const params: GetObjectRequest = { Bucket: USER_INFO_BUCKET_NAME, Key: username };
    return new Promise((resolve, reject) => {
        s3.getObject(params, function (err, data) {
            if (err) {
                return reject(err);
            }

            // Convert body buffer to string json
            const body = data.Body?.toString();
            if (body == null) {
                reject("No body");
                return;
            }
            let parsed: any;
            try {
                parsed = JSON.parse(body);
            } catch (error) {
                deleteUserKeys(username);
                console.error("Deleting Corrupt User Info: ", username);
                reject("Corrupt user info");
            }

            const userParse = userServerInfoSchema.safeParse(parsed);
            if (!userParse.success) {
                console.error("Deleting Corrupt User Info: ", username);
                console.error(parsed);
                deleteUserKeys(username);
                return reject("Invalid user info");
            }
            resolve(parsed as UserServerInfo);

        });
    });
}

export async function deleteUserKeys(username: string): Promise<void> {
    const params: DeleteObjectRequest = { Bucket: USER_INFO_BUCKET_NAME, Key: username };
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}