import {
  getPresignedPostUrl,
} from "@/lib/files";
import { randomUUID } from "crypto";
import { PublicError } from "@/use-cases/errors";

const MIME_TO_EXTENSION: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "video/mp4": ["mp4"],
  "video/quicktime": ["mov"],
};

const MAX_UPLOAD_SIZE_IN_MB = 50;
const MAX_UPLOAD_SIZE = 1024 * 1024 * MAX_UPLOAD_SIZE_IN_MB; // 50MB

export async function getPresignedUploadUrlUseCase({
  filename,
  mimeType,
  fileSize,
}: {
  filename: string;
  mimeType: string;
  fileSize: number;
}) {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new PublicError("File has no extension");
  }

  const allowedExtensions = MIME_TO_EXTENSION[mimeType];

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    throw new PublicError(
      `File extension "${extension}" does not match MIME type "${mimeType}"`,
    );
  }

  if (fileSize > MAX_UPLOAD_SIZE) {
    throw new PublicError(
      `File size should be less than ${MAX_UPLOAD_SIZE_IN_MB}MB.`,
    );
  }

  // Generate a unique object key so filenames never collide
  // const extension = filename.split(".").pop();
  // const objectKey = `${uuidv4()}.${extension}`;

  const objectKey = `original/${randomUUID()}.${extension}`;
  const presignedPost = await getPresignedPostUrl(objectKey, mimeType);

  return { presignedPost, objectKey };
}
