import { Metadata } from "next/types";
import MapMediaLayout from "@/components/MapMediaLayout";
import IconInformationCircle from "@/icons/IconInformationCircle";

export const metadata: Metadata = {
  title: "Media Map",
  description: "Main Map of VOICE Platform.",
  alternates: {
    canonical: "/map",
  },
};

export default function Map() {
  return (
    <>
      <div className="w-fit md:mx-auto text-center text-sm text-gray-500 py-1 px-4 italic border shadow-xs rounded-sm mb-2 mx-4">
        <IconInformationCircle size={17} className="inline-block mr-1" />
        Automatic anonymization not yet implemented. Anything you upload will be
        publicly visible, so please remove any identifying information you do
        not want published.
      </div>
      <MapMediaLayout />
    </>
  );
}
