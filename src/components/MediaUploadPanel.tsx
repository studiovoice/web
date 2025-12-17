"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import IconX from "@/icons/IconX";
import IconTag from "@/icons/IconTag";
import {
  getPresignedUploadUrlAction,
  createMediaItemAction,
} from "@/actions/media-items";

interface MediaUploadPanelProps {
  location: { lat: number; lng: number };
  onClose: () => void;
}

// TODO: Replace with real trending tags from database
const TRENDING_TAGS = [
  "architecture",
  "wildlife",
  "urban",
  "equality",
  "activism",
];

function MediaUploadPanel({ location, onClose }: MediaUploadPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ title: false, file: false });

  // Warn user if they try to leave while uploading
  useEffect(() => {
    if (!isUploading) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setTouched((prev) => ({ ...prev, file: true })); // they had a file and removed it
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get presigned URL from server
      const presignedResult = await getPresignedUploadUrlAction({
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      if ("error" in presignedResult) {
        setError(presignedResult.error ?? "Failed to get upload URL");
        return;
      }

      const { presignedPost, objectKey } = presignedResult;

      // Step 2: Upload file directly to S3 using the presigned POST
      const s3FormData = new FormData();
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        s3FormData.append(key, value as string);
      });
      s3FormData.append("file", file); // must be last

      const uploadRes = await fetch(presignedPost.url, {
        method: "POST",
        body: s3FormData,
      });

      if (!uploadRes.ok) {
        setError("Upload to S3 failed. Please try again.");
        return;
      }

      // Step 3: Create DB record after confirmed S3 upload
      const createResult = await createMediaItemAction({
        objectKey,
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        title: title.trim(),
        description: description.trim() || undefined,
        latitude: location.lat,
        longitude: location.lng,
        capturedAt: capturedAt || undefined,
        tagNames: selectedTags,
      });

      if ("error" in createResult) {
        setError(createResult.error ?? "Failed to save media item");
        return;
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (!isUploading) onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim().toLowerCase().replace(/\s+/g, "");
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full ${
        isUploading ? "pointer-events-none" : ""
      }`}
    >
      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 font-medium">Uploading…</p>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center p-2 sm:p-3 border-b">
        <h2 className="text-xl sm:text-2xl font-semibold">Upload Media</h2>
        {/* <button
          onClick={handleCancel}
          className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <IconX className="h-5 w-5 sm:h-6 sm:w-6" />
        </button> */}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        <div className="grow overflow-auto p-2 sm:p-6 scrollbar-hide space-y-3 sm:space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label
              className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700"
              htmlFor="title"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input p-2 sm:p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              placeholder="Enter a title"
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
            />
            {touched.title && !title.trim() && (
              <p className="text-sm text-red-500 mt-1">Title is required</p>
            )}
          </div>

          <div>
            <label
              className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea p-2 sm:p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base min-h-20"
              placeholder="Enter a description"
            />
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-base sm:text-lg text-gray-700">
                Tags
              </label>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="mb-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-min">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm whitespace-nowrap shrink-0"
                    >
                      {/* <IconTag className="h-3 w-3 mr-1" /> */}
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:bg-red-200 rounded-full p-0.5 cursor-pointer"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <IconTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add custom tag..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                  className={`px-4 py-2 rounded-md font-medium text-sm shrink-0 ${
                    customTag.trim()
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Trending tags:
              </p>
              <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-min">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {/* <IconTag className="h-3 w-3 mr-1" /> */}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="pt-2">
            {!isUploading && (
              <div>
                <label className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700">
                  Upload File <span className="text-red-500">*</span>
                </label>
                {filePreview ? (
                  <div className="mt-1 relative border-2 border-gray-300 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 cursor-pointer"
                      aria-label="Remove file"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col items-center">
                      <Image
                        src={filePreview}
                        alt="Preview"
                        className="max-h-48 w-auto object-contain mb-2"
                        width={192}
                        height={192}
                      />
                      {file && (
                        <p className="text-sm text-gray-700">{file.name}</p>
                      )}
                    </div>
                  </div>
                ) : file && !file.type.startsWith("image/") ? (
                  // Non-image file preview (video)
                  <div className="mt-1 relative border-2 border-gray-300 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 cursor-pointer"
                      aria-label="Remove file"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-gray-700 font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file"
                          className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none"
                        >
                          <span>Select a file</span>
                          <input
                            id="file"
                            name="file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WEBP, MP4, MOV up to 50MB
                      </p>
                    </div>
                  </div>
                )}
                {touched.file && !file && (
                  <p className="text-sm text-red-500 mt-1">
                    Please select a file
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700"
              htmlFor="capturedAt"
            >
              Date & Time Taken
            </label>
            <input
              id="capturedAt"
              type="datetime-local"
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
              className="form-input p-2 sm:p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
            />
          </div>

          {/* Location */}
          <div className="pt-2 sm:pt-4">
            <label className="block mb-1 sm:mb-2 text-base sm:text-lg text-gray-700">
              Location Coordinates
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-200 text-gray-800 rounded-full shadow-sm flex items-center justify-center">
                <span className="font-semibold mr-1">Lat:</span>{" "}
                {location.lat.toFixed(4)}
              </div>
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-200 text-gray-800 rounded-full shadow-sm flex items-center justify-center">
                <span className="font-semibold mr-1">Lng:</span>{" "}
                {location.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="shrink-0 p-2 sm:p-4 border-t bg-gray-50">
          <div className="flex justify-center gap-3 sm:gap-4">
            {!isUploading && (
              <>
                <Button
                  type="submit"
                  disabled={!file || !title.trim()}
                  className={`px-4 py-2 flex-1 max-w-[120px] sm:max-w-[150px] text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 cursor-pointer ${
                    file && title.trim()
                      ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Upload
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 flex-1 max-w-[120px] sm:max-w-[150px] bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default MediaUploadPanel;
