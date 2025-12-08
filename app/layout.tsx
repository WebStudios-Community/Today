import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: "600",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Today",
  description: "To Do List App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased bg-neutral-950 min-h-screen select-none`}
      >
        {children}
      </body>
    </html>
  );
}
