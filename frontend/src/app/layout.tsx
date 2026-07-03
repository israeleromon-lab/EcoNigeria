import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
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
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
