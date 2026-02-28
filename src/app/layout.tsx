import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StatementIQ — Bank Statement Intelligence",
  description: "Convert PDF bank statements into categorized, analyzed, and visualized financial intelligence. Auto-categorization, dashboards, reports, and more.",
  keywords: ["bank statement", "PDF converter", "financial intelligence", "categorization", "income verification"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
