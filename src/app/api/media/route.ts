import { getMediaItemsByBoundsUseCase } from "@/use-cases/media-items";
import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const north = parseFloat(searchParams.get("north") ?? "");
  const south = parseFloat(searchParams.get("south") ?? "");
  const east = parseFloat(searchParams.get("east") ?? "");
  const west = parseFloat(searchParams.get("west") ?? "");

  if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
    return NextResponse.json(
      { error: "Missing or invalid bounds parameters" },
      { status: 400 },
    );
  }

  try {
    const items = await getMediaItemsByBoundsUseCase({
      north,
      south,
      east,
      west,
    });

    const itemsWithUrls = items.map((item) => ({
      ...item,
      url: `${env.FILE_STORAGE_ENDPOINT}/${item.objectKey}`,
    }));

    // return NextResponse.json({ items });
    return NextResponse.json({ items: itemsWithUrls });
  } catch (error) {
    console.error("Error fetching media items:", error);
    return NextResponse.json(
      { error: "Failed to fetch media items", items: [] },
      { status: 500 },
    );
  }
}
