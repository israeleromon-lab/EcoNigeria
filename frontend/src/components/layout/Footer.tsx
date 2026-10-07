"use client";

import { useState, useEffect } from "react";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollRoot = document.getElementById("terminal-scroll-root");
      if (!scrollRoot) return;

      const isNearBottom =
        scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight < 200;

      setIsVisible(isNearBottom);
    };

    const scrollRoot = document.getElementById("terminal-scroll-root");
    scrollRoot?.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollRoot?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer
      className={`border-t border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 md:px-8 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-end gap-3">
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
              width="110"
              height="40"
              loading="lazy"
              decoding="async"
              style={{
                display: "inline-block",
                border: 0,
                width: "100%",
                maxWidth: "110px",
                height: "auto",
                maxHeight: "40px",
                opacity: 0.95,
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
