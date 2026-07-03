import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EconoNigeria - Economic Intelligence Platform",
  description: "AI-powered economic data and forecasting platform for Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
