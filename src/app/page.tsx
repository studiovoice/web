import Image from "next/image";
import previewImage from "@/assets/preview.png";

const features = [
  {
    label: "Search & Discover",
    title: "Find any location around the world",
    description:
      "Quickly find locations around the world where events and protests are happening, and explore what’s being documented there.",
    video: process.env.SEARCH_VIDEO_URL,
    alt: "Search bar demo",
  },
  {
    label: "Add Media",
    title: "Document & Share",
    description:
      "Double-click on the map to add a new event or media post at a specific location, making it visible to others.",
    video: process.env.UPLOADING_VIDEO_URL,
    alt: "Uploading media demo",
  },
  {
    label: "Compare Locations",
    title: "View multiple locations at once",
    description:
      "Select multiple markers to compare different media entries side by side.",
    video: process.env.SELECT_COMPARE_VIDEO_URL,
    alt: "Select and Compare markers demo",
  },
  {
    label: "Privacy Tools (Coming Soon)",
    title: "Automatic face blurring & voice anonymization",
    description:
      "Protect identities while documenting events. Soon you’ll be able to automatically blur faces in photos/videos and anonymize voices.",
    video: "",
    alt: "Privacy tools demo",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto bg-zinc-50 font-sans px-4 md:px-2">
      <div className="text-center py-4 px-4">
        <h1 className="text-5xl font-bold mb-4">
          MAPPING FOR
          <span className="text-red-500"> SOCIAL JUSTICE</span>
        </h1>

        <p className="hero-descriptor text-gray-600 max-w-xl mx-auto mb-8">
          Explore how mapping and spatial visualization can enhance
          understanding and advocacy for social justice.
        </p>
        <div className="mt-10">
          <Image
            src={previewImage}
            alt="Platform preview"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="pb-24 space-y-8">
        {features.map((feature, i) => {
          const isReversed = i % 2 !== 0;
          return (
            <div
              key={feature.title}
              className={`flex flex-col ${
                isReversed ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-10 md:gap-16 rounded-md border border-gray-200 bg-white p-8 md:p-12 shadow-xs`}
            >
              {/* Text side */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">
                  {feature.label}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4 text-gray-900">
                  {feature.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-0 md:mb-6 text-[15px]">
                  {feature.description}
                </p>
              </div>

              {/* Video side */}
              <div className="flex-1 w-full min-w-0">
                <div className="relative overflow-hidden aspect-video">
                  {feature.video ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={feature.alt}
                      className="w-full h-full"
                    >
                      <source src={feature.video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 border border-gray-200 bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        width="48"
                        height="48"
                      >
                        <rect
                          x="5"
                          y="11"
                          width="14"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          stroke="currentColor"
                          strokeWidth="1.5"
                          d="M8 11V7a4 4 0 018 0v4"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
