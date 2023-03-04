// import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '$env/static/private';
// import type { LayoutServerLoad } from './$types';
// import AWS from 'aws-sdk';


// process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
// process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;

// AWS.config.update({ region: 'us-west-2' });

// const s3 = new AWS.S3({ apiVersion: '2006-03-01' });


// Call S3 to list the buckets

export const load = (async () => {
    return {};
}) satisfies LayoutServerLoad;