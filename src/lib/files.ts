import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { env } from "@/env";

const s3Client = new S3Client({
  region: env.FILE_STORAGE_REGION,
  credentials: {
    accessKeyId: env.FILE_STORAGE_ACCESS_KEY,
    secretAccessKey: env.FILE_STORAGE_SECRET_KEY,
  },
});

export async function getDownloadUrl(objectName: string) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.FILE_STORAGE_BUCKET,
      Key: objectName,
    }),
    { expiresIn: 3600 },
  );
}

export async function uploadFileToBucket(file: File, filename: string) {
  const Key = filename;
  // const Bucket = env.AWS_S3_BUCKET_NAME;
  const Bucket = env.FILE_STORAGE_BUCKET;

  let res;

  try {
    const parallelUploads = new Upload({
      client: s3Client,
      params: {
        Bucket,
        Key,
        Body: file.stream(),
        // ACL: "public-read", // managed via bucket policy
        ContentType: file.type,
      },
      queueSize: 4,
      leavePartsOnError: false,
    });

    res = await parallelUploads.done();
  } catch (e) {
    throw e;
  }

  return res;
}

export async function getPresignedPostUrl(
  objectName: string,
  contentType: string,
) {
  return await createPresignedPost(s3Client, {
    Bucket: env.FILE_STORAGE_BUCKET,
    Key: objectName,
    Conditions: [
      ["content-length-range", 0, 1024 * 1024 * 50], // reject files over 50MB
      ["starts-with", "$Content-Type", contentType], // reject wrong content types (ensure content type matches what we expect)
    ],
    Expires: 600, // 10 minutes
    Fields: {
      // acl: "public-read",
      "Content-Type": contentType,
    },
  });
}

export async function getFileUrl({ key }: { key: string }) {
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.FILE_STORAGE_BUCKET,
      Key: key,
    }),
    { expiresIn: 3600 },
  );
  return url;
}
