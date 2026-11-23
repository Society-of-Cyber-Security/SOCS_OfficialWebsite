import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { ClientProviders } from "@/core/providers/AppProviders";
import { AuthProvider } from "@/core/context/AuthContext";
import { CustomCursor } from "@/shared/components/ui/CustomCursor";

const spaceGrotesk = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-space",
  display: "swap",
});

const firaCode = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "SOCS — Society of Cyber Security",
  description: "Society of Cyber Security Network — Research, Hacking, and Defense Community",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${firaCode.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-body bg-[var(--color-cyber-black)] text-[var(--color-cyber-white)] overflow-x-hidden selection:bg-[var(--color-cyber-neon)] selection:text-white" suppressHydrationWarning>
        <ClientProviders>
          <AuthProvider>
            <CustomCursor />
            <Navbar />
            <main className="flex-grow flex flex-col items-center">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
