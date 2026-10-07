"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Only show footer on explore page (home page "/")
  const shouldShowFooter = pathname === "/";

  useEffect(() => {
    if (!shouldShowFooter) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      const scrollRoot = document.getElementById("terminal-scroll-root");
      if (!scrollRoot) return;

      // Check if user is at the very bottom of the page (within 50px)
      const isAtBottom =
        scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight < 50;

      setIsVisible(isAtBottom);
    };

    const scrollRoot = document.getElementById("terminal-scroll-root");
    scrollRoot?.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollRoot?.removeEventListener("scroll", handleScroll);
    };
  }, [shouldShowFooter]);

  // Don't render footer on non-explore pages
  if (!shouldShowFooter) {
    return null;
  }

  // Don't render footer element at all if not visible (keeps it out of DOM)
  if (!isVisible) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 md:px-8 lg:px-10 py-2 sm:py-3">
        <div className="flex items-center justify-end">
          <a
            href="https://www.codehype.ai/product/econonigeria?utm_source=codehype_badge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
            aria-label="Featured on CodeHype"
          >
            <img
              src="https://www.codehype.ai/badges/econonigeria.svg?variant=find-us&v=20"
              alt="Featured on CodeHype"
              width="90"
              height="33"
              loading="lazy"
              decoding="async"
              style={{
                display: "inline-block",
                border: 0,
                width: "100%",
                maxWidth: "90px",
                height: "auto",
                maxHeight: "33px",
                opacity: 0.9,
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
