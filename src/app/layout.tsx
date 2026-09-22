import type { Metadata } from "next";
import { Epilogue, Space_Mono } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ibrahim Khalil — UI/UX Designer & Systems Architect",
  description:
    "Personal developer and UI/UX portfolio of Ibrahim Khalil. Designing digital products with clarity, structure, and intent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${epilogue.variable} ${spaceMono.variable} scroll-smooth`}
    >
      <body className="bg-[#0C0C0C] text-[#F3F3F3] antialiased selection:bg-[#E5B842] selection:text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
