import { Metadata } from "next/types";
import MapMediaLayout from "@/components/MapMediaLayout";

export const metadata: Metadata = {
  title: "Media Map",
  description: "Main Map of VOICE Platform.",
  alternates: {
    canonical: "/map",
  },
};

export default function Map() {
  return <MapMediaLayout />;
}
