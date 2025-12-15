"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import IconX from "@/icons/IconX";
import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";
import IconMapPin from "@/icons/IconMapPin";
import IconListBullet from "@/icons/IconListBullet";
import IconArrowsOut from "@/icons/IconArrowsOut";
import IconPlay from "@/icons/IconPlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "single" | "list";

interface MediaGalleryPanelProps {
  selectedMediaItems: string[];
  mediaItems: {
    [id: string]: {
      title: string;
      description: string;
      objectKey: string;
      url: string;
    };
  };
  activeMediaItem: string | null;
  setActiveMediaItem: (id: string | null) => void;
  toggleItemSelection: (id: string) => void;
  clearSelections: () => void;
  onClose?: () => void;
  hoveredItemId: string | null;
  onItemHover: (id: string | null) => void;
}

function MediaGalleryPanel({
  selectedMediaItems,
  mediaItems,
  activeMediaItem,
  setActiveMediaItem,
  toggleItemSelection,
  clearSelections,
  hoveredItemId,
  onItemHover,
}: MediaGalleryPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [playingVideos, setPlayingVideos] = useState<{ [id: string]: boolean }>(
    {},
  );

  const getActiveMediaItem = useCallback(() => {
    if (!activeMediaItem) return null;
    return mediaItems[activeMediaItem];
  }, [activeMediaItem, mediaItems]);

  const activeItem = getActiveMediaItem();
  const isVideo = activeItem
    ? /\.(mp4|mov)$/i.test(activeItem.objectKey)
    : false;

  const getMimeType = useCallback((url: string) => {
    if (url.endsWith(".mp4")) return "video/mp4";
    if (url.endsWith(".mov")) return "video/quicktime";
    return "";
  }, []);

  const getThumbnail = useCallback(
    (id: string) => {
      const item = mediaItems[id];
      if (!item)
        return "https://placehold.co/600x400/222222/FFFFFF?text=No+Image";

      const isVideoItem = /\.(mp4|mov)$/i.test(item.objectKey);

      if (isVideoItem) {
        return `https://placehold.co/400x400/?text=video`;
      }

      // return item.objectKey;
      return item.url;
    },
    [mediaItems],
  );

  const getSelectedItems = useCallback(() => {
    return selectedMediaItems.map((id) => ({
      id,
      ...mediaItems[id],
    }));
  }, [selectedMediaItems, mediaItems]);

  const toggleVideoPlayback = useCallback((id: string) => {
    setPlayingVideos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handlePrevious = useCallback(() => {
    const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
    const prevIndex =
      (currentIndex - 1 + selectedMediaItems.length) %
      selectedMediaItems.length;
    setActiveMediaItem(selectedMediaItems[prevIndex]);
  }, [activeMediaItem, selectedMediaItems, setActiveMediaItem]);

  const handleNext = useCallback(() => {
    const currentIndex = selectedMediaItems.indexOf(activeMediaItem!);
    const nextIndex = (currentIndex + 1) % selectedMediaItems.length;
    setActiveMediaItem(selectedMediaItems[nextIndex]);
  }, [activeMediaItem, selectedMediaItems, setActiveMediaItem]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-3 flex items-center justify-end">
        {selectedMediaItems.length > 0 && (
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-md">
              <Button
                variant={viewMode === "single" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 cursor-pointer"
                onClick={() => setViewMode("single")}
              >
                <IconArrowsOut className="h-4 w-4" />
                <span className="sr-only">Single view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 cursor-pointer"
                onClick={() => setViewMode("list")}
              >
                <IconListBullet className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelections}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {selectedMediaItems.length > 0 && viewMode === "single" && (
        <div className="shrink-0">
          <div className="h-20 sm:h-24">
            <div className="flex p-2 gap-3 sm:gap-4 mx-2 sm:mx-3 overflow-x-auto scrollbar-hide">
              {selectedMediaItems.map((id, index) => {
                const isHovered = id === hoveredItemId;
                const isActive = activeMediaItem === id;

                return (
                  <div
                    key={id}
                    className="relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden cursor-pointer transition-all duration-200"
                    style={{
                      transform: isHovered ? "scale(1.06)" : "scale(1)",
                      zIndex: isHovered ? 10 : isActive ? 5 : 1,
                      outline: isActive
                        ? isHovered
                          ? "3px solid #ef4444"
                          : "2px solid #ef4444"
                        : isHovered
                          ? "2px solid #ef4444"
                          : "none",
                      outlineOffset: "2px",
                    }}
                    onClick={() => setActiveMediaItem(id)}
                    onMouseEnter={() => onItemHover(id)}
                    onMouseLeave={() => onItemHover(null)}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={getThumbnail(id)}
                        alt={mediaItems[id]?.title}
                        className="min-w-full min-h-full object-cover"
                        // width={80}
                        // height={80}
                        fill
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-0 left-0 bg-red-500 text-white px-1 py-0.5 text-xs">
                      {index + 1}
                    </div>
                    <button
                      className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-white/80 hover:bg-red-500 hover:text-white rounded-bl-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(id);
                      }}
                    >
                      <IconX className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grow overflow-hidden">
        <div className="h-full w-full overflow-y-auto scrollbar-hide">
          {selectedMediaItems.length > 0 ? (
            <>
              {viewMode === "single" && activeItem && (
                <div className="h-full flex flex-col">
                  <div className="grow overflow-y-auto scrollbar-hide">
                    <div className="p-2 pt-1 sm:px-4">
                      <div className="relative aspect-video bg-gray-100 overflow-hidden mb-2 sm:mb-4">
                        {isVideo ? (
                          <div className="flex items-center justify-center w-full h-full">
                            <video
                              key={activeItem.objectKey}
                              controls
                              className="max-w-full max-h-full"
                            >
                              <source
                                src={activeItem.url}
                                type={getMimeType(activeItem.objectKey)}
                              />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <Image
                              src={activeItem.url}
                              alt={activeItem.title}
                              className="max-w-full max-h-full object-contain"
                              width={640}
                              height={360}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold">
                            {activeItem.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground border",
                              )}
                            >
                              {isVideo ? "Video" : "Image"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm sm:text-base text-gray-700">
                            {activeItem.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedMediaItems.length > 1 && (
                    <div className="shrink-0 p-2 sm:px-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm cursor-pointer"
                          onClick={handlePrevious}
                        >
                          <IconChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="ml-1">Prev</span>
                        </Button>
                        <span className="text-sm text-gray-500">
                          {selectedMediaItems.indexOf(activeMediaItem!) + 1} of{" "}
                          {selectedMediaItems.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm cursor-pointer"
                          onClick={handleNext}
                        >
                          <span className="mr-1">Next</span>
                          <IconChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewMode === "list" && (
                <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                  {getSelectedItems().map((item, index) => {
                    const isHovered = item.id === hoveredItemId;
                    const isVideoItem = /\.(mp4|mov)$/i.test(item.objectKey);
                    const isPlaying = playingVideos[item.id] || false;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          isHovered ? "ring-2 ring-red-500" : "",
                        )}
                        onMouseEnter={() => onItemHover(item.id)}
                        onMouseLeave={() => onItemHover(null)}
                      >
                        <div className="p-2 sm:p-3 border-b flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full text-xs font-semibold bg-red-500 text-white">
                              {index + 1}
                            </span>
                            <h3 className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-[250px] lg:max-w-[400px]">
                              {item.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setActiveMediaItem(item.id);
                                setViewMode("single");
                              }}
                            >
                              <IconArrowsOut className="h-4 w-4" />
                              <span className="sr-only">View full</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-red-100 cursor-pointer"
                              onClick={() => toggleItemSelection(item.id)}
                            >
                              <IconX className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:max-h-80">
                          <div className="md:w-1/2 shrink-0 relative">
                            <div className="aspect-video w-full h-full bg-gray-100">
                              {isVideoItem ? (
                                <>
                                  {isPlaying ? (
                                    <div className="flex items-center justify-center w-full h-full">
                                      <video
                                        key={`playing-${item.objectKey}`}
                                        controls
                                        className="max-w-full max-h-full"
                                      >
                                        <source
                                          src={item.url}
                                          type={getMimeType(item.objectKey)}
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    </div>
                                  ) : (
                                    <div className="relative w-full h-full">
                                      <div className="flex items-center justify-center w-full h-full overflow-hidden relative">
                                        <Image
                                          src={getThumbnail(item.id)}
                                          alt={item.title}
                                          className="min-w-full min-h-full object-cover"
                                          // width={640}
                                          // height={360}
                                          fill
                                          unoptimized
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/40 text-white rounded-none cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleVideoPlayback(item.id);
                                        }}
                                      >
                                        <IconPlay className="h-12 w-12" />
                                        <span className="sr-only">
                                          Play video
                                        </span>
                                      </Button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center justify-center w-full h-full overflow-hidden">
                                  <Image
                                    src={item.url}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain"
                                    width={640}
                                    height={360}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-2 sm:p-4 md:w-1/2 md:max-h-80 overflow-auto">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground border",
                                  )}
                                >
                                  {isVideoItem ? "Video" : "Image"}
                                </span>
                                {isVideoItem && isPlaying && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs py-0 px-2 cursor-pointer"
                                    onClick={() => toggleVideoPlayback(item.id)}
                                  >
                                    Stop Playing
                                  </Button>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-700">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <IconMapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-base sm:text-lg font-medium">
                  No Media Selected
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Select items from the map
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaGalleryPanel;
