"use client";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 md:px-8 lg:px-10 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} EconoNigeria. Open Economic Intelligence Platform.
          </div>
          
          {/* CodeHype Badge - Subtle and Right-Aligned */}
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
              width="120" 
              height="45"
              className="h-auto max-h-[45px]"
              loading="lazy" 
              decoding="async"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
