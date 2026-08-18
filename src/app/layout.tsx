import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { ClientProviders } from "@/core/providers/AppProviders";
import { AuthProvider } from "@/core/context/AuthContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
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
