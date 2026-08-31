import CustomCodeInjector from "@/components/CustomCodeInjector";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import type { Metadata } from "next";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Providers } from "./providers";
import SiteAccessGate from "@/components/SiteAccessGate";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  title: "SUNU REWUM",
  description: "Plateforme officielle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <SiteAccessGate>
          <BackgroundWrapper>
            <NotificationProvider>
              <I18nProvider>
                <Providers>{children}</Providers>
              </I18nProvider>
            </NotificationProvider>
          </BackgroundWrapper>
        </SiteAccessGate>
      </body>
    </html>
  );
}
