import type { Metadata } from "next";
import { AuthProvider } from "./AuthProvider";
import { ThemeAndLangProvider } from "./ThemeAndLangProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where I've Been",
  description:
    "Gezilen şehirleri, mekan yorumlarını ve puanları harita üzerinde toplayan gezi uygulaması.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeAndLangProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeAndLangProvider>
      </body>
    </html>
  );
}
