"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import logoImage from "@/assets/logo.png";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="sticky top-0 z-50 bg-zinc-50 mb-4">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-2 py-2 mt-2">
        <div className="flex items-center">
          <Link href="/" className="cursor-pointer">
            <Image
              src={logoImage}
              alt="logo"
              height={120}
              className="h-10 w-auto lg:h-18"
              loading="eager"
            />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className={`cursor-pointer hover:text-red-500 border-b-2 border-transparent ${
              isActive("/") ? "text-red-500 lg:border-red-500" : ""
            }`}
          >
            Home
          </Link>

          <Link
            href="/map"
            className={`cursor-pointer hover:text-red-500 border-b-2 border-transparent ${
              isActive("/map") ? "text-red-500 lg:border-red-500" : ""
            }`}
          >
            Map
          </Link>

          <Link
            href="/about"
            className={`cursor-pointer hover:text-red-500 border-b-2 border-transparent ${
              isActive("/about") ? "text-red-500 lg:border-red-500" : ""
            }`}
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
