import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPMN Renderer",
  description: "Open and render BPMN 2.0 diagrams in your browser with bpmn-js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
