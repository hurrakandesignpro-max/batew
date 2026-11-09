import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getData } from "@/lib/store";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Escale à deux";
  try {
    title = (await getData()).config.siteTitle;
  } catch {
    // on garde le titre par défaut
  }
  return {
    title: `${title} ⚓`,
    description: "Une petite escale rien que pour nous deux.",
    robots: { index: false, follow: false },
    icons: {
      icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⛵</text></svg>",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b9e6f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
