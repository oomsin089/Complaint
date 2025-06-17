import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../utils/QueryProvider";
import { SessionProvider } from "../utils/useSession";
import { AuthProvider } from "../utils/auth"; // ตรวจสอบ path ให้ถูกต้อง

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบรับเรื่องร้องเรียน/ร้องทุกข์คณะบริหารธุรกิจ",
  description:
    "ระบบรับเรื่องร้องเรียน/ร้องทุกข์คณะบริหารธุรกิจ คณะบริหารธุรกิจ มหาวิทยาลัยเทคโนโลยรราชมงคล ธัญบุรี",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <QueryProvider>
            <AuthProvider> {/* เพิ่ม AuthProvider ตรงนี้ */}
              {children}
            </AuthProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
