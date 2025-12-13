"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MediaItem } from "@/db/schema";
import Geocoder from "@/components/Geocoder";
import { env } from "@/env";

class CoordinateZoomControl {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.container.style.background = "rgba(0, 0, 0, 0.3)";
    this.container.style.padding = "5px";
    this.container.style.borderRadius = "5px";
    this.container.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.2)";
    this.container.style.position = "absolute";
    this.container.style.top = "2px";
    this.container.style.right = "2px";
    this.container.style.zIndex = "1";
    this.container.style.fontSize = "12px";
    this.container.style.color = "#fff";
    this.container.style.opacity = "0.8";
    this.container.style.padding = "1px";
    this.container.style.width = "120px";
    this.container.style.textAlign = "center";
  }

  onAdd(map: mapboxgl.Map) {
    this.update(map);
    map.on("move", () => this.update(map));
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
  }

  private update(map: mapboxgl.Map) {
    const { lng, lat } = map.getCenter();
    const zoom = map.getZoom().toFixed(2);
    this.container.innerHTML = `
      <div>Lng: ${lng.toFixed(4)}</div>
      <div>Lat: ${lat.toFixed(4)}</div>
      <div>Zoom: ${zoom}</div>
    `;
  }
}

export interface MediaMapProps {
  onMapDoubleClick: (location: { lat: number; lng: number }) => void;
  onMarkerClick: (
    id: string,
    content: { title: string; description: string; contentUrl: string },
  ) => void;
  setClearPreviewMarker: (clearMarkerFunction: () => void) => void;
  selectedMarkerId: string | null;
  selectedMarkerIds: string[];
  hoveredItemId: string | null;
  onMarkerHover: (id: string | null) => void;
  viewMode: "full" | "split";
}

const MAPBOX_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

function MediaMap({
  onMapDoubleClick,
  onMarkerClick,
  setClearPreviewMarker,
  selectedMarkerId,
  selectedMarkerIds,
  hoveredItemId,
  onMarkerHover,
  viewMode,
}: MediaMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const previewMarker = useRef<mapboxgl.Marker | null>(null);
  const markers = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const controlAdded = useRef(false);

  // TODO: let user set initial location (e.g. asks them where they want to start; save in local storage?)
  const initialLng = useRef(51.35140956290013);
  const initialLat = useRef(35.70152639644212);
  const initialZoom = useRef(12);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const mapHeight = viewMode === "split" ? "h-[48vh] md:h-[80vh]" : "h-[80vh]";

  // Memoize the double click handler to prevent recreation
  // const handleDoubleClick = useCallback(
  //   (e: mapboxgl.MapMouseEvent) => {
  //     e.preventDefault();
  //     const { lng, lat } = e.lngLat;

  //     if (previewMarker.current) {
  //       previewMarker.current.remove();
  //     }

  //     previewMarker.current = new mapboxgl.Marker({ color: "red" })
  //       .setLngLat(e.lngLat)
  //       .addTo(map.current!);

  //     onMapDoubleClick({ lat, lng });
  //   },
  //   [onMapDoubleClick],
  // );

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/thienantran/cmhwj732t00go01ss9p3j5bul",
      center: [initialLng.current, initialLat.current],
      zoom: initialZoom.current,
      pitch: 45,
    });

    map.current.on("load", () => {
      console.log("Map loaded");
      setMapLoaded(true);
    });

    // map.current.on("dblclick", handleDoubleClick);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update double click handler when it changes
  // useEffect(() => {
  //   if (!map.current) return;

  //   map.current.off("dblclick", handleDoubleClick);
  //   map.current.on("dblclick", handleDoubleClick);
  // }, [handleDoubleClick]);
  useEffect(() => {
    if (!map.current) return;

    const handleDoubleClick = (e: mapboxgl.MapMouseEvent) => {
      e.preventDefault();
      const { lng, lat } = e.lngLat;

      if (previewMarker.current) {
        previewMarker.current.remove();
      }

      previewMarker.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat(e.lngLat)
        .addTo(map.current!);

      onMapDoubleClick({ lat, lng });
    };

    map.current.on("dblclick", handleDoubleClick);

    return () => {
      map.current?.off("dblclick", handleDoubleClick);
    };
  }, [onMapDoubleClick]);

  // Clear preview marker function
  useEffect(() => {
    const clearMarker = () => {
      console.log("Clearing preview marker", previewMarker.current);
      if (previewMarker.current) {
        previewMarker.current.remove();
        previewMarker.current = null;
      }
    };

    setClearPreviewMarker(clearMarker);
  }, [setClearPreviewMarker]);

  // Initialize geocoder and controls - only once
  useEffect(() => {
    if (!mapLoaded || !map.current || controlAdded.current) return;

    const control = new CoordinateZoomControl();
    map.current.addControl(control, "top-right");

    const wrapper = document.createElement("div");
    wrapper.className = "hidden sm:block";
    wrapper.appendChild(control.onAdd(map.current));
    map.current.getContainer().appendChild(wrapper);

    controlAdded.current = true;
  }, [mapLoaded]);

  // Fetch media items from Next.js API
  // TODO: fetch based on map bounds
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        const response = await fetch("/api/media");
        if (!response.ok) {
          throw new Error("Failed to fetch media items");
        }

        const data = await response.json();
        const items: MediaItem[] = data.items ?? [];
        setMediaItems(items);
      } catch (error) {
        console.error("Error fetching media items:", error);
      }
    };

    if (mapLoaded) {
      fetchMediaItems();
    }
  }, [mapLoaded]);

  // Create and update markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    mediaItems.forEach((item: MediaItem) => {
      const { id, latitude, longitude, title, description, objectKey } = item;
      const lngLat: [number, number] = [
        parseFloat(longitude.toString()),
        parseFloat(latitude.toString()),
      ];

      const isSelected = selectedMarkerIds.includes(id);
      const isActive = id === selectedMarkerId;
      const isHovered = id === hoveredItemId;
      const markerNumber = isSelected
        ? selectedMarkerIds.indexOf(id) + 1
        : null;

      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.fontSize = "50px";

      const markerColor = isHovered
        ? "#ff0000"
        : isActive
          ? "#ef4444"
          : isSelected
            ? "#f87171"
            : "#dc2626";
      markerElement.style.color = markerColor;
      markerElement.style.cursor = "pointer";
      markerElement.style.filter = isHovered
        ? "drop-shadow(0 0 8px rgba(255,0,0,0.8))"
        : "none";

      if (isSelected) {
        const bgColor = isHovered
          ? "#ff0000"
          : isActive
            ? "#ef4444"
            : "#f87171";
        markerElement.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: ${bgColor};
            color: white;
            border-radius: 50%;
            border: 2px solid white;
            font-size: 14px;
            ${isHovered ? "box-shadow: 0 0 10px rgba(255,0,0,0.8);" : ""}
          ">${markerNumber}</div>
        `;
      } else {
        markerElement.innerHTML = "◦";
      }

      markerElement.addEventListener("mouseenter", () => {
        markerElement.style.fontSize = "70px";
        if (!isSelected) {
          markerElement.innerHTML = "•";
        }
        onMarkerHover(id);
      });

      markerElement.addEventListener("mouseleave", () => {
        markerElement.style.fontSize = "50px";
        if (!isSelected) {
          markerElement.innerHTML = "◦";
        }
        onMarkerHover(null);
      });

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(lngLat)
        .addTo(map.current!);

      marker.getElement().addEventListener("click", () => {
        // Clear preview marker when clicking on a media marker
        if (previewMarker.current) {
          previewMarker.current.remove();
          previewMarker.current = null;
        }
        onMarkerClick(id, {
          title,
          description: description || "",
          contentUrl: objectKey,
        });
      });

      markers.current[id] = marker;
    });
  }, [
    mapLoaded,
    mediaItems,
    onMarkerClick,
    selectedMarkerId,
    selectedMarkerIds,
    hoveredItemId,
    onMarkerHover,
  ]);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Resize map when needed
  useEffect(() => {
    if (map.current && mapLoaded) {
      const resizeTimer = setTimeout(() => {
        map.current?.resize();
      }, 300);

      return () => clearTimeout(resizeTimer);
    }
  }, [viewMode, windowSize, mapLoaded]);

  const handleGeocoderResult = (result: { lng: number; lat: number }) => {
    map.current?.jumpTo({
      center: [result.lng, result.lat],
      zoom: 14,
    });
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`container mx-auto ${mapHeight} p-2 rounded-lg relative`}>
        {/* Geocoder Searchbox */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-xs sm:left-4 sm:translate-x-0 sm:max-w-sm md:max-w-md">
          <Geocoder
            accessToken={MAPBOX_TOKEN}
            onResult={handleGeocoderResult}
            placeholder="Search for places"
          />
        </div>

        <div
          ref={mapContainer}
          className="h-full w-full rounded-lg overflow-hidden"
        />

        {selectedMarkerIds.length > 0 && (
          <div className="absolute bottom-4 md:bottom-12 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
            {selectedMarkerIds.length} selected
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaMap;
