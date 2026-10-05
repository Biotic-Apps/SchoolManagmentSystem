import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "eSchool", template: "%s · eSchool" },
  description: "eSchool Management System",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Per-request rendering so Next can apply the CSP nonce from src/proxy.ts.
  await connection();
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-body text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
