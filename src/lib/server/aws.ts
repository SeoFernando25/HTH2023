
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '$env/static/private';
import AWS, { S3 } from 'aws-sdk';
import type { PutObjectRequest } from 'aws-sdk/clients/s3';
import { smallSha } from './sha';
import { smallRandom } from './uuid';


const BUCKET_NAME = 'hth-storage-bucket';
process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;

AWS.config.update({ region: 'us-west-2' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export async function saveBlob(fn: string, blob: Blob): Promise<string> {
    const blobKey = smallRandom();

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadParams: PutObjectRequest = {
        Bucket: BUCKET_NAME,
        Key: blobKey, Body: buffer,
        ContentDisposition: `attachment; filename="${fn}"`
    };

    return new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                reject(err);
            } if (data) {
                resolve(data.Location);
            }
        });
    });
}

export async function loadBlob(blobId: string): Promise<S3.Body> {
    const params = { Bucket: BUCKET_NAME, Key: blobId };
    return new Promise((resolve, reject) => {
        s3.getObject(params, function (err, data) {
            if (err) {
                reject(err);
            } if (data) {
                if (!data.Body) {
                    reject("No body");
                } else {
                    resolve(data.Body);
                }
            }
        });
    });
}


export async function getAllFilenames(): Promise<string[]> {
    const params = { Bucket: BUCKET_NAME };
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