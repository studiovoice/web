import Image from "next/image";
import { Metadata } from "next/types";
import researchImage from "@/assets/research.webp";
import IconExternal from "@/icons/IconExternal";

export const metadata: Metadata = {
  title: "About VOICE",
  description: "The mission and team behind the VOICE Platform",
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return (
    <div className="flex flex-col justify-center container mx-auto px-4 md:px-2">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-black mb-6 mt-6">
            About VOICE
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            VOICE (Visual Outputs for Inclusive Change and Environments) is a
            nonprofit organization that works at the intersection of
            architecture, urban design, social science, and technology to
            promote and advocate for social justice in conflicted areas.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed sm:mb-6">
            This platform is developed as part of VOICE&apos;s mission to create
            tools that document, analyze, and protect user-generated digital
            content related to historical events and protests. By leveraging
            mapping and spatial visualization, we aim to enhance understanding
            and advocacy for social justice issues.
          </p>
        </div>

        <div className="flex-1 mb-5 sm:mb-0 sm:mt-16">
          <Image
            src={researchImage}
            alt="VOICE illustration"
            className="w-full h-auto rounded-xs shadow-lg object-cover"
          />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-black mb-4 mt-6">VOICE Team</h2>
      <p className="text-lg text-gray-600 leading-relaxed mb-6">
        The VOICE team is composed of dedicated individuals from diverse
        backgrounds, including architecture and computer science. Learn more
        about the team on our main website:{" "}
        <a
          href="https://www.studiovoice.org/meet-our-people-1"
          target="_blank"
          rel="noreferrer"
          className="text-red-500 inline-flex items-center group underline"
        >
          Meet our team
          <IconExternal className="ml-1 w-3 h-3" />
        </a>
      </p>

      <p className="text-lg text-gray-600 leading-relaxed mb-6">
        Visit{" "}
        <a
          href="https://studiovoice.org"
          target="_blank"
          rel="noreferrer"
          className="text-red-500 inline-flex items-center group underline"
        >
          studiovoice.org
          <IconExternal className="ml-1 w-3 h-3" />
        </a>{" "}
        for more information about our projects and initiatives.
      </p>

      <h2 className="text-3xl font-bold text-black mb-4 mt-6">Open-source</h2>
      <p className="text-lg text-gray-600 leading-relaxed mb-6">
        This platform is open-source, built to encourage transparency,
        collaboration, and community-driven development. We believe that tools
        for advocacy and digital preservation should be accessible and open to
        everyone. We are building in public and always welcome community
        contributors who want to help make things better.
      </p>

      <p className="text-lg text-gray-600 leading-relaxed mb-6">
        Explore our open source projects, including this platform, on{" "}
        <a
          href="https://github.com/studiovoice"
          target="_blank"
          rel="noreferrer"
          className="text-red-500 inline-flex items-center group underline"
        >
          github.com/studiovoice
          <IconExternal className="ml-1 w-3 h-3" />
        </a>
      </p>

      <p className="text-lg text-gray-600 leading-relaxed mb-12">
        If you discover a security vulnerability within the platform, or any of
        our other open-source projects, please email us at{" "}
        <a
          href="mailto:ttran.voice@gmail.com"
          className="text-red-500 underline"
        >
          ttran.voice@gmail.com
        </a>
      </p>
    </div>
  );
}
