import type { Metadata } from "next";
import { Epilogue, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
  icons: {
    icon: [
      { url: "/images/ik-logo-96.png", sizes: "96x96", type: "image/png" },
      { url: "/images/ik-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/ik-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/images/ik-logo-96.png",
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
      suppressHydrationWarning
      data-theme="dark"
      className={`${epilogue.variable} ${spaceMono.variable} scroll-smooth dark`}
    >
      <head>
        {/* Anti-FOUC theme initialization script: executes before initial render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var stored = localStorage.getItem('theme');
                var theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="bg-[var(--theme-bg-page)] text-[var(--theme-text-primary)] antialiased selection:bg-[#E5B842] selection:text-black min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
