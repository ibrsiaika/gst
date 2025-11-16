import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/lib/TenantContext";

export const metadata: Metadata = {
  title: "GST Compliance SaaS Platform",
  description: "Complete solution for Indian businesses to manage GST compliance, e-invoicing, and tax returns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
