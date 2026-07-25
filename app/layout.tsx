import type { Metadata } from "next";
import { AuthProvider } from "./AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where I've Been",
  description:
    "Gezilen şehirleri, mekan yorumlarını ve puanları harita üzerinde toplayan gezi uygulaması.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
