import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Our Life — shared mental load",
  description: "Get it out of your head. Make it visible. Work it out together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
