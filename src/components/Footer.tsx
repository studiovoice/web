import Link from "next/link";
import IconGitHub from "@/icons/IconGitHub";
import IconInstagram from "@/icons/IconInstagram";
import IconLinkedIn from "@/icons/IconLinkedIn";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-zinc-50">
      <h2 className="sr-only">Page footer</h2>

      <div className="container mx-auto flex flex-col sm:flex-row justify-between sm:items-center py-3 text-base text-gray-600 mt-5 px-4 md:px-2">
        <p className="mb-2 sm:mb-0">
          Built by the
          <Link
            href="https://github.com/studiovoice"
            target="_blank"
            rel="noopener noreferrer"
            // className="ml-1 font-medium underline flex items-center justify-center transition-colors hover:text-gray-800"
            className="underline hover:text-gray-800"
          >
            <IconGitHub size={16} className="mx-1 inline-block" />
            VOICE team and community.
          </Link>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-5 sm:mt-0">
          <Link href="/terms" className="underline hover:text-gray-800">
            Terms of Service
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/privacy" className="underline hover:text-gray-800">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">•</span>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="underline hover:text-gray-800 text-left sm:text-right cursor-pointer"
              >
                Contact Us
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact & Support</DialogTitle>
                <DialogDescription>
                  Reach out to us with any questions or issues.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-1">Questions & feedback</p>
                  <p className="text-sm">
                    Send us an email at{" "}
                    <a
                      href="mailto:ttran.voice@gmail.com"
                      className="text-red-500 hover:text-red-600"
                    >
                      ttran.voice@gmail.com
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Bug reports</p>
                  <p className="text-sm">
                    If you&apos;ve found a bug, let us know through our{" "}
                    <a
                      href="https://forms.gle/SXVhXV2w5aUGDu7m7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-600"
                    >
                      bug report form
                    </a>
                    . Your feedback helps us improve the platform!
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* <hr className="border-t border-gray-100 mx-5 sm:mx-22 my-2" /> */}

      <div className="container mx-auto flex flex-col sm:flex-row justify-between sm:items-center py-3 text-gray-600 mt-2 mb-1 px-4 md:px-2">
        <div className="text-left sm:text-center">
          &copy; {new Date().getFullYear()} VOICE Inc.
        </div>

        <div className="text-left sm:text-center mt-5 sm:mt-0 flex gap-4 items-center">
          <Link
            href="https://www.instagram.com/studiovoice_official/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-800"
          >
            <IconInstagram size={22} className="inline-block" />
          </Link>
          <Link
            href="https://www.linkedin.com/company/studiovoice"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-800"
          >
            <IconLinkedIn size={22} className="inline-block" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
