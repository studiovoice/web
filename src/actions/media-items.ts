"use server";

import { createMediaItemUseCase } from "@/use-cases/media-items";
import { getPresignedUploadUrlUseCase } from "@/use-cases/files";
import { PublicError } from "@/use-cases/errors";

// Step 1: Client requests a presigned URL before uploading
export async function getPresignedUploadUrlAction({
  filename,
  mimeType,
  fileSize,
}: {
  filename: string;
  mimeType: string;
  fileSize: number;
}) {
  try {
    const { presignedPost, objectKey } = await getPresignedUploadUrlUseCase({
      filename,
      mimeType,
      fileSize,
    });

    return { presignedPost, objectKey };
  } catch (err) {
    if (err instanceof PublicError) {
      return { error: err.message };
    }
    console.error(err);
    return { error: "Something went wrong" };
  }
}

// Step 2: After the client confirms the upload succeeded, create the DB record
export async function createMediaItemAction(data: {
  objectKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  capturedAt?: string;
  tagNames?: string[];
}) {
  try {
    const { tagNames, capturedAt, ...rest } = data;

    const mediaItem = await createMediaItemUseCase(
      {
        ...rest,
        mediaType: rest.mimeType.startsWith("video/") ? "video" : "image",
        capturedAt: capturedAt ? new Date(capturedAt) : undefined,
        processingStatus: "pending",
        moderationStatus: "pending",
      },
      tagNames ?? [],
    );

    return { mediaItem };
  } catch (err) {
    if (err instanceof PublicError) {
      return { error: err.message };
    }
    console.error(err);
    return { error: "Something went wrong" };
  }
}
