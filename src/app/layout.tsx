import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/providers/modal-provider";
import Nav from "@/components/ui/nav";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Language Sounds",
  description: "Language Sounds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <div className="flex flex-col min-h-screen justify-center items-center"> */}
        <ModalProvider />
        <div className="flex flex-col min-h-screen">
          <Nav />
          <div className="h-full">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
