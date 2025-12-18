"use client";

import { useState, useCallback } from "react";
import MediaMap from "@/components/MediaMap";
import MediaUploadPanel from "@/components/MediaUploadPanel";
import MediaGalleryPanel from "@/components/MediaGalleryPanel";

export default function MapMediaLayout() {
  const [showMediaUploadPanel, setShowMediaUploadPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [clearPreviewMarker, setClearPreviewMarker] = useState<
    (() => void) | null
  >(null);

  // Multi-selection states
  const [selectedMediaItems, setSelectedMediaItems] = useState<string[]>([]);
  const [activeMediaItem, setActiveMediaItem] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<{
    [id: string]: {
      title: string;
      description: string;
      objectKey: string;
      url: string;
    };
  }>({});
  const [viewMode, setViewMode] = useState<"full" | "split">("full");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleDoubleClick = useCallback(
    (location: { lat: number; lng: number }) => {
      // Close MediaGalleryPanel and clear selections first
      setSelectedMediaItems([]);
      setActiveMediaItem(null);
      setViewMode("split");

      // Then open MediaUploadPanel
      setSelectedLocation(location);
      setShowMediaUploadPanel(true);
    },
    [],
  );

  const handleCloseMediaUploadPanel = useCallback(() => {
    setShowMediaUploadPanel(false);
    setSelectedLocation(null);
    setViewMode("full");
    if (clearPreviewMarker) clearPreviewMarker();
  }, [clearPreviewMarker]);

  const handleMarkerClick = useCallback(
    (
      id: string,
      content: {
        title: string;
        description: string;
        objectKey: string;
        url: string;
      },
    ) => {
      // Always clear the preview marker when clicking any marker
      if (clearPreviewMarker) clearPreviewMarker();

      // If MediaUploadPanel is open, close it first
      if (showMediaUploadPanel) {
        setShowMediaUploadPanel(false);
        setSelectedLocation(null);
        // if (clearPreviewMarker) clearPreviewMarker();
      }

      // Store the media item data first (regardless of selection state)
      setMediaItems((items) => ({
        ...items,
        [id]: content,
      }));

      setSelectedMediaItems((prev) => {
        // Check if we're deselecting an item
        if (prev.includes(id)) {
          const newSelectedItems = prev.filter((itemId) => itemId !== id);

          // If we're deselecting the active item, pick a new active item
          setActiveMediaItem((current) => {
            if (current === id) {
              if (newSelectedItems.length > 0) {
                return newSelectedItems[0];
              } else {
                return null;
              }
            }
            return current;
          });

          // If no items left, close the MediaGalleryPanel
          if (newSelectedItems.length === 0) {
            setViewMode("full");
          }

          return newSelectedItems;
        }

        // We're selecting a new item
        const newSelectedItems = [...prev, id];

        // If this is the first item being selected, make it active
        if (prev.length === 0) {
          setActiveMediaItem(id);
          setViewMode("split");
        }

        return newSelectedItems;
      });
    },
    [showMediaUploadPanel, clearPreviewMarker],
  );

  const handleSetActiveItem = useCallback(
    (id: string | null) => {
      setActiveMediaItem(id);
      if (id && viewMode === "full") {
        setViewMode("split");
      }
    },
    [viewMode],
  );

  const clearSelections = useCallback(() => {
    setSelectedMediaItems([]);
    setActiveMediaItem(null);
    setViewMode("full");
  }, []);

  const handleCloseMediaGalleryPanel = useCallback(() => {
    setViewMode("full");
    setSelectedMediaItems([]);
    setActiveMediaItem(null);
  }, []);

  const handleItemHover = useCallback((id: string | null) => {
    setHoveredItemId(id);
  }, []);

  const handleSetClearPreviewMarker = useCallback(
    (clearFunction: () => void) => {
      setClearPreviewMarker(() => clearFunction);
    },
    [],
  );

  return (
    <div className="flex container mx-auto p-2 md:p-0 mb-3">
      <div className="flex w-full gap-4 flex-col md:flex-row">
        {/* MediaMap */}
        <div
          className={`
            relative md:h-full
            ${viewMode === "split" || showMediaUploadPanel ? "md:w-1/2 h-[50vh]" : "md:w-full h-[80vh]"}
            transition-all duration-300 ease-in-out
          `}
        >
          <div
            className={`h-full flex flex-col ${viewMode === "split" || showMediaUploadPanel ? "rounded-lg shadow-lg overflow-hidden border border-gray-300" : ""}`}
          >
            <MediaMap
              onMapDoubleClick={handleDoubleClick}
              onMarkerClick={handleMarkerClick}
              setClearPreviewMarker={handleSetClearPreviewMarker}
              selectedMarkerId={activeMediaItem}
              selectedMarkerIds={selectedMediaItems}
              hoveredItemId={hoveredItemId}
              onMarkerHover={handleItemHover}
              viewMode={viewMode}
            />
          </div>
        </div>

        {/* MediaUploadPanel */}
        {showMediaUploadPanel && selectedLocation && (
          <div className="w-full md:w-1/2">
            <div className="rounded-lg shadow-lg overflow-hidden border border-gray-300 h-full flex flex-col">
              <MediaUploadPanel
                location={selectedLocation}
                onClose={handleCloseMediaUploadPanel}
              />
            </div>
          </div>
        )}

        {/* MediaGalleryPanel */}
        {viewMode === "split" &&
          !showMediaUploadPanel &&
          selectedMediaItems.length > 0 && (
            <div className="w-full md:w-1/2">
              <div className="bg-transparent rounded-lg shadow-lg overflow-hidden border border-gray-300 h-[50vh] md:h-[calc(91vh-25px)] flex flex-col">
                <MediaGalleryPanel
                  selectedMediaItems={selectedMediaItems}
                  mediaItems={mediaItems}
                  activeMediaItem={activeMediaItem}
                  setActiveMediaItem={handleSetActiveItem}
                  toggleItemSelection={(id) =>
                    handleMarkerClick(id, mediaItems[id])
                  }
                  clearSelections={clearSelections}
                  onClose={handleCloseMediaGalleryPanel}
                  hoveredItemId={hoveredItemId}
                  onItemHover={handleItemHover}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
